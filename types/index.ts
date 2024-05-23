export interface TRAResType<T> {
  EFDMS: T;
}
export interface RegistrationEFDMSType {
  EFDMSRESP: EFDMSRESPType;
  EFDMSSIGNATURE: string;
}

export interface EFDMSRESPType {
  ACKCODE: string;
  ACKMSG: string;
  REGID: string;
  SERIAL: string;
  UIN: string;
  TIN: string;
  VRN: string;
  MOBILE: string;
  ADDRESS: string;
  STREET: string;
  CITY: string;
  COUNTRY: string;
  NAME: string;
  RECEIPTCODE: string;
  REGION: string;
  ROUTINGKEY: string;
  GC: string;
  TAXOFFICE: string;
  USERNAME: string;
  PASSWORD: string;
  TOKENPATH: string;
  TAXCODES: TAXCODESType;
}

export interface TAXCODESType {
  CODEA: string;
  CODEB: string;
  CODEC: string;
  CODED: string;
}
export interface RegistrationBody {
  REGDATA: RegistrationContent;
}

export interface RegistrationContent {
  TIN: string;
  CERTKEY: string;
}
