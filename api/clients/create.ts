import register_client, { RegisterOptsType } from "#app/client/register";
import fs from "fs";
import path from "path";
import TraNet from "#lib/tra-transport";
import {
  AppState,
  FailedResponse,
  IConsole,
  IHttp,
  Response,
  z,
  type HttpRequest,
} from "moonsight";
import { Stream, Transform, pipeline } from "stream";
import Client from "#models/Client";
import { getSerialNumberFromCertificate } from "#lib/security";

export const index = IHttp(async (req: HttpRequest) => {
  const body: RegisterOptsType = req.utils.parseBody(
    z.object({
      certkey: z.string(),
      tin: z.string(),
      privateKey64: z.string(),
      certificate_serial: z.string(),
    }),
  );

  const [client, message] = await register_client(body);
  console.log("request", client, message);
  return Response(client, { message });
}, []);

export const iconsole = IConsole(async (app: AppState) => {
  const certkey = app.getArgv().argv.certkey;
  const tin = app.getArgv().argv.tin;
  const privateKey = app.getArgv().argv.key;
  let certificate_serial = app.getArgv().argv.certserial;
  let certificate_path = app.getArgv().argv.certpath;
  if (!certkey) throw new Error("certkey (certkey) is required");
  if (!tin) throw new Error("tin (tin) is required");
  if (!privateKey) throw new Error("private key (key) is required");
  if (!certificate_serial && certificate_path) {
    certificate_serial = getSerialNumberFromCertificate(certificate_path);
  }
  if (!certificate_serial) {
    throw new Error(
      "certificate serial (certserial) or certificate path (certpath) is required",
    );
  }

  const _privateKey: Buffer = fs.readFileSync(privateKey);
  const _privateKey64 = _privateKey.toString("base64");
  const result = await register_client({
    certkey,
    tin,
    privateKey64: _privateKey64,
    certificate_serial,
  });
  console.log(result);
}, {});

