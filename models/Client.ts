import IModel from "./IModel";

export default class Client extends IModel {
  name!: string;
  id!: number;
  status!: number;
  tin!: string;
  vendor_serial_number!: string;
  reg_id!: string;
  privatekey64!: string;
  certificate_serial_number!: string;
  uin!: string;
  vrn!: string;
  mobile!: string;
  address!: string;
  street!: string;
  city!: string;
  region!: string;
  country!: string;
  receipt_code!: string;
  routing_key!: string;
  routing_zkey!: string;
  gc!: number;
  tax_office!: string;
  username!: string;
  password!: string;
  token_path!: string;
  registered!: number;
  registered_on!: number;
  token_value!: string;
  token_expiry!: number;
  vat_registered!: string;
  taxcodes!: string;

  static get tableName() {
    return "clients";
  }
  static STATUS_ACTIVE = 1;
  static STATUS_INACTIVE = 0;

  taxcodelist(): TaxCode[] {
    const codes: TaxCode[] = this.taxcodes.split(",").map((sl, pos): TaxCode => {
      const e = sl.split(":");
      return {
        pos,
        name: e[0],
        rate: Number(e[1]),
        code: String(e[0].at(-1)),
      };
    }).sort((a, b) => a.code.toLowerCase().localeCompare(b.code.toLowerCase()));
    return codes;
  }
}

export type TaxCode = {
  pos: number,
  code: string;
  rate: number;
  name: string;
};
