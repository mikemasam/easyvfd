import { IHttp, Response } from "moonsight";

export const index = IHttp(async () => {
  console.log("request")
  return Response(true, { message: "Ok" });
}, []);
