import querystring from "querystring";
import axios from "axios";
import { buildXmlContent, xmlToObject } from "./exchange";
import { TRAResType } from "types";
import { AppLogger } from "moonsight";
export default class TraNet {
  ctx: { outputType: string, headers: any; data: any; url: string } = {
    headers: { "Client": "webapi" },
    data: null,
    url: "",
    outputType: "xml"
  };
  constructor(url) {
    this.ctx.url = `${process.env.TRA_URL}/${url}`;
  }
  toXml(){
    this.ctx.outputType = "xml";
  }
  async postEfdms<T>(): Promise<[TRAResType<T> | null, string | null, number, string]> {
    AppLogger.log("tra-transport", this.ctx)
    const result = await axios
      .post(this.ctx.url, this.ctx.data, {
        headers: this.ctx.headers,
      })
      .catch((er) => {
        //console.log(er);
        return {
          data: null,
          statusText: er?.response ?? er.message ?? null,
          status: 400
        };
      });
    if(!result || !result.data) return [null, null, result?.status, result?.statusText];
    //if(this.ctx.outputType != "xml") return [result];
    const [out, xml]: [TRAResType<T> | null, string] = await xmlToObject(result.data);
    if(!out) return [null, xml, result.status, result.statusText];
    return [out, xml, result.status, result.statusText];
  }
  async post() {
    const result = await axios
      .post(this.ctx.url, this.ctx.data, {
        headers: this.ctx.headers,
      })
      .catch((er) => {
        //console.log(`--> [${er.message}]`);
        return er?.response || null;
      });
    return [result.data, result, result.status, result.statusText];
  }
  auth(token: string) {
    this.ctx.headers["Authorization"] = `Bearer ${token}`;
    return this;
  }
  routingKey(key: string) {
    this.ctx.headers["Routing-Key"] = key;
    return this;
  }
  certSerial(cert: string) {
    this.ctx.headers["Cert-Serial"] = Buffer.from(cert).toString("base64");
    return this;
  }
  contentSignedXml(xml: Object, privateKey64: string) {
    this.ctx.headers["Content-Type"] = "Application/xml";
    const [out] = buildXmlContent(xml, privateKey64)
    AppLogger.log("tra-transport", out)
    this.ctx.data = out;
    return this;
  }
  contentForm(data: any) {
    this.ctx.headers["Content-Type"] = "Application/x-www-form-urlencoded";
    this.ctx.data = querystring.stringify(data);
    return this;
  }
  static make(url: string): TraNet {
    return new TraNet(url);
  }
}
