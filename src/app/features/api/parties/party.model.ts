export interface Party {
  id?: number;
  tenantId?: string;
  partyType: 'CUSTOMER' | 'VENDOR' | 'BOTH';
  name: string;
  tradeName?: string;
  gstin?: string;
  pan?: string;
  stateCode: string;
  email?: string;
  phone?: string;
  address?: string;
  openingBalance: number;
  currentBalance: number;
  isActive?: boolean;
}
