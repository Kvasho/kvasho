const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Role = "owner" | "accountant" | "viewer";

export type Company = {
  id: number;
  name: string;
  logo_url: string | null;
  tax_id: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  bank_account: string | null;
  currency: string;
  invoice_prefix: string;
};

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: Role | null;
  can: { manage_company: boolean; manage_invoices: boolean };
  company: Company | null;
};

/** Field name → messages, as Laravel returns them on a 422. */
export type ValidationErrors = Record<string, string[]>;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors: ValidationErrors = {},
  ) {
    super(message);
  }
}

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Laravel sets the XSRF-TOKEN cookie; it is echoed back as a header on writes. */
async function refreshCsrfCookie() {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, { credentials: "include" });
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

/** Call the Invoicer API and return the `data` of its JSON response. */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return (await send<{ data: T }>(path, options))?.data as T;
}

/**
 * Call the Invoicer API with the session cookie and return the whole JSON
 * body. Writes carry the CSRF token, fetched first if the browser has none
 * yet and once more if it went stale.
 */
async function send<T>(
  path: string,
  { method = "GET", body, signal }: RequestOptions = {},
  retried = false,
): Promise<T> {
  const isWrite = method !== "GET";

  if (isWrite && !readCookie("XSRF-TOKEN")) {
    await refreshCsrfCookie();
  }

  const isForm = body instanceof FormData;
  const headers: Record<string, string> = {
    Accept: "application/json",
    // The page's language (set on <html> by the root layout), so validation
    // messages come back in it.
    "Accept-Language": document.documentElement.lang || "en",
  };
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  if (isWrite) headers["X-XSRF-TOKEN"] = readCookie("XSRF-TOKEN") ?? "";

  const response = await fetch(`${API_URL}/api/v1/invoicer${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    credentials: "include",
    signal,
  });

  // CSRF token mismatch: the session expired. Fetch a fresh token and try once more.
  if (response.status === 419 && !retried) {
    await refreshCsrfCookie();
    return send<T>(path, { method, body, signal }, true);
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      data?.message ?? `Request failed with ${response.status}`,
      data?.errors ?? {},
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export function fetchCurrentUser(signal?: AbortSignal) {
  return api<CurrentUser>("/me", { signal });
}

export function login(input: { email: string; password: string; remember: boolean }) {
  return api<CurrentUser>("/login", { method: "POST", body: input });
}

export function register(input: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  company_name: string;
}) {
  return api<CurrentUser>("/register", { method: "POST", body: input });
}

export function logout() {
  return api<void>("/logout", { method: "POST" });
}

export type CompanyInput = Partial<Omit<Company, "id" | "logo_url">>;

export function updateCompany(input: CompanyInput) {
  return api<Company>("/company", { method: "PATCH", body: input });
}

export function uploadCompanyLogo(file: File) {
  const form = new FormData();
  form.append("logo", file);
  return api<Company>("/company/logo", { method: "POST", body: form });
}

export function removeCompanyLogo() {
  return api<Company>("/company/logo", { method: "DELETE" });
}

/** A page of results as Laravel's paginator returns it. */
export type Paginated<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};

export type Client = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  tax_id: string | null;
  created_at: string;
};

export type ClientInput = Omit<Client, "id" | "created_at">;

export function listClients(
  { search = "", page = 1 }: { search?: string; page?: number },
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("search", search);
  return send<Paginated<Client>>(`/clients?${params}`, { signal });
}

export function fetchClient(id: string | number, signal?: AbortSignal) {
  return api<Client>(`/clients/${id}`, { signal });
}

export function createClient(input: ClientInput) {
  return api<Client>("/clients", { method: "POST", body: input });
}

export function updateClient(id: number, input: ClientInput) {
  return api<Client>(`/clients/${id}`, { method: "PUT", body: input });
}

export function deleteClient(id: number) {
  return api<void>(`/clients/${id}`, { method: "DELETE" });
}
