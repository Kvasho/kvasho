<?php

namespace App\Enums;

enum CompanyRole: string
{
    /** Everything, including company settings and the team. */
    case Owner = 'owner';

    /** Clients, invoices and payments. */
    case Accountant = 'accountant';

    /** Read-only access. */
    case Viewer = 'viewer';

    public function canManageCompany(): bool
    {
        return $this === self::Owner;
    }

    public function canManageInvoices(): bool
    {
        return $this !== self::Viewer;
    }
}
