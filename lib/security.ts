import crypto from "crypto";
import fs from "fs";
import { pki } from "node-forge";

export const signData = (data: string, base64PrivateKey: string) => {
  if (!base64PrivateKey) return [false, "Client signature key not set"];
  const private_key = Buffer.from(base64PrivateKey, "base64").toString();
  if (!private_key) return [false, "Client signature key not found"];
  // Signing
  const signer = crypto.createSign("RSA-SHA1");
  signer.write(data);
  signer.end();
  try {
    //console.log(private_key)
    const signature = signer.sign(private_key, "base64");
    if (!signature) return [false, "Client signature failed"];
    return [signature, ""];
  } catch (e) {
    console.log(e);
    return [false, "Client signature failed"];
  }
};

export function getSerialNumberFromCertificate(_path: string) {
  try {
    const content = fs.readFileSync(_path, "utf8");
    const ca = new pki.certificateFromPem(content);
    return ca.serialNumber;
  } catch (ex) {}
  return null;
}
