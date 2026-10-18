export interface TrialBalanceRow {
  ledgerId: number;
  ledgerCode: string;
  ledgerName: string;
  groupName: string;
  nature: string;
  closingDebit: number;
  closingCredit: number;
}

export interface TrialBalanceReport {
  asOfDate: string;
  rows: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}
