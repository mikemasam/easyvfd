export interface IncomingReceipt {
  tin: string;
  issued_date: string;
  bill_reference: string;
  bill_receipt: string;
  customer_id: string;
  customer_id_type: string;
  customer_name: string;
  customer_mobile: string;
  items: {
    ref?: string; // Optional property
    desc: string;
    qty: number;
    amount_excl: number;
    amount_tax: number;
    amount_incl?: number; // Optional property
    tax_code: string;
  }[];
  payments: {
    ref?: string; // Optional property
    type: "CASH" | "CHEQUE" | "CCARD" | "EMONEY" | "INVOICE";
    amount: number;
  }[];
}



export interface ReceiptBody {
  RCT: ReceiptContent;
}

export interface ReceiptContent {
  DATE: string;
  TIME: string;
  TIN: string;
  REGID: string;
  EFDSERIAL: string;
  CUSTIDTYPE: string;
  CUSTID: string;
  CUSTNAME: string;
  MOBILENUM: string;
  RCTNUM: string;
  DC: string;
  GC: string;
  ZNUM: string;
  RCTVNUM: string;
  ITEMS: RctItems;
  TOTALS: Totals;
  PAYMENTS: Payments;
  VATTOTALS: Vattotals;
}

export interface RctItems {
  ITEM: RctItem[];
}

export interface RctItem {
  ID: string;
  DESC: string;
  QTY: string;
  TAXCODE: string;
  AMT: string;
}
export interface Payments {
  PMTTYPE: string;
  PMTAMOUNT: string;
}

export interface Totals {
  TOTALTAXEXCL: string;
  TOTALTAXINCL: string;
  DISCOUNT: string;
}

export interface Vattotals {
  VATRATE: string;
  NETTAMOUNT: string;
  TAXAMOUNT: string;
}

export interface RctAck {
  RCTNUM: string;
  DATE: string;
  TIME: string;
  ACKCODE: number;
  ACKMSG: string;
}

export interface RctAckEFDMSType {
  RCTACK: RctAck
}

export interface ZAckEFDMSType {
  ZACK: ZAck
}

export interface ZAck {
  ZNUMBER: string;
  DATE: string;
  TIME: string;
  ACKCODE: number;
  ACKMSG: string;
}

