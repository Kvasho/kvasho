import { Suspense } from "react";
import ClientDetail from "./client-detail";

// The id is only known at request time, so it is read inside Suspense.
export default function ClientPage({ params }: PageProps<"/[lang]/invoicer/clients/[id]">) {
  return (
    <Suspense fallback={null}>
      <ClientDetail params={params} />
    </Suspense>
  );
}
