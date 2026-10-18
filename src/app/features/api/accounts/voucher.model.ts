export interface VoucherItem {
  id?: number;
  ledgerId: number;
  ledgerName?: string;
  ledgerCode?: string;
  entryType: 'DEBIT' | 'CREDIT';
  amount: number;
  lineNarration?: string;
}

export interface VoucherRequest {
  id?: number;
  voucherNumber?: string;
  voucherType: 'JOURNAL' | 'PAYMENT' | 'RECEIPT' | 'CONTRA';
  voucherDate: string;
  narration?: string;
  referenceNo?: string;
  items: VoucherItem[];
}
