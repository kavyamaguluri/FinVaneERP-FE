export interface AccountGroup {
  id: number;
  tenantId: string;
  name: string;
  parentId?: number;
  nature: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  groupLevel: number;
  scheduleIiiLine?: string;
  isBuiltin: boolean;
}

export interface AccountLedger {
  id?: number;
  code: string;
  name: string;
  groupId: number;
  groupName?: string;
  groupNature?: string;
  secondaryGroupId?: number;
  secondaryGroupName?: string;
  openingBalance: number;
  currentBalance: number;
  sectorReportLine?: string;
  description?: string;
  isActive?: boolean;
}
