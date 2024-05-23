import TraNet from "#lib/tra-transport";
import Client from "#models/Client";
import { DateTime } from "luxon";
import { EFDMSRESPType, RegistrationBody, RegistrationEFDMSType } from "types";

export type RegisterOptsType = {
  tin: string;
  certkey: string;
  privateKey64: string;
  certificate_serial: string;
};
type ReturnType = Promise<[Client | false, string]>;
async function register_client(opts: RegisterOptsType): ReturnType {
  const [client, err] = await checkDup(opts);
  if (!client) return [false, err];
  const body: RegistrationBody = {
    REGDATA: {
      TIN: client.tin,
      CERTKEY: client.vendor_serial_number,
    },
  };
  const [result, raw, code, message] = await TraNet.make(process.env.REGISTER_CLIENT_URL!)
    .contentSignedXml(body, opts.privateKey64)
    .certSerial(opts.certificate_serial)
    .postEfdms<RegistrationEFDMSType>();
  if(!result?.EFDMS) {
    return [false, `Request Failed with ${code} + ${message}`];
  }
  const item = result.EFDMS.EFDMSRESP;
  if(item.ACKCODE != "0") return [false, "Failed with error code: " + item.ACKMSG];
  await patch_registration(item)
  return [false, result.EFDMS.EFDMSRESP.ACKMSG ?? "Failed"];
}
export default register_client;

const patch_registration = async (item: EFDMSRESPType) => {
  const changes: Partial<Client> = {
    reg_id: item.REGID,
    uin: item.UIN,
    mobile: item.MOBILE,
    vrn: item.VRN,
    address: item.ADDRESS,
    street: item.STREET,
    city: item.CITY,
    country: item.COUNTRY,
    name: item.NAME,
    receipt_code: item.RECEIPTCODE,
    region: item.REGION,
    routing_key: item.ROUTINGKEY,
    gc: parseInt(item.GC),
    tax_office: item.TAXOFFICE,
    username: item.USERNAME,
    password: item.PASSWORD,
    token_path: item.TOKENPATH,
    taxcodes: Object.keys(item.TAXCODES).map(e => `${e}:${item.TAXCODES[e]}`).join(","),
    registered_on: DateTime.now().toMillis(),
    registered: 1
  }
  await Client.query().where("tin", item.TIN).patch(changes)
  return [true, "Registration successful"];
}

const checkDup = async (opts: RegisterOptsType): Promise<[Client | false, string]> => {
  let dup: any = null;
  dup = await Client.query().findOne({ vendor_serial_number: opts.certkey });
  if (dup) return [dup, "Duplicate serial"];
  dup = await Client.query().insert({ 
    vendor_serial_number: opts.certkey,
    tin: opts.tin ,
    privatekey64: opts.privateKey64,
    certificate_serial_number: opts.certificate_serial
  });
  if (!dup) return [false, "creation failed"];
  return [dup, "not Duplicate"];
};
