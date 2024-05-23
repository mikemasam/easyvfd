import Client from "#models/Client";
import xml2js from "xml2js";
import { signData } from "./security";
import builder_xml from "./sxml";
export const objectToXmlHeadless = (obj: any) => {
  return new xml2js.Builder({
    headless: true,
    //@ts-ignore
    renderOpts: { 'pretty': false, 'indent': '', 'newline': '', allowEmpty: true  }
  }).buildObject(obj);
};
export const objectToXml = (obj: any) => {
  return new xml2js.Builder({
    //@ts-ignore
    renderOpts: { pretty: true, indent: '', newline: '', allowEmpty: true }
  }).buildObject(obj);
};

export const buildXmlContent = (obj: any, privateKey: string) => {
  const [signature, err] = signData(builder_xml(obj, { header: false }), privateKey);
  const body = {
    EFDMS: {
      ...obj,
      EFDMSSIGNATURE: signature,
    },
  };
  return [builder_xml(body, { header: true }), ""];
};

export const xmlToObject = async (xml: any): Promise<[any | null, string]> => {
  const result: Object | null = await xml2js.parseStringPromise(xml, { explicitArray: false }).then(function (result) {
    return result;
  }).catch(function (err) {
      return null;
    })
  return [result, xml];
}


