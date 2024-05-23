import TraNet from "#lib/tra-transport";
import Client from "#models/Client";
import { DateTime } from "luxon";

type ReturnType = Promise<[string | false, string]>;
async function request_token(client_id: number): ReturnType {
  const client = await Client.query().findById(client_id);
  if (!client) return [false, "Profile not found"];
  const body = {
    username: client.username,
    password: client.password,
    grant_type: "password",
  };
  const [data, ...other] = await TraNet.make(process.env.TOKEN_URL!)
    .contentForm(body)
    .post();
  console.log("out", other);
  if (!data) return [false, "Invalid authentication"];
  if (!data.access_token || data.expires_in < 1) {
    await Client.query()
      .patch({ token_expiry: -1, token_value: "" })
      .where({ id: client.id });
    return [false, "Invalid authentication response"];
  }
  await Client.query()
    .where({ id: client.id })
    .patch({
      token_value: data.access_token,
      token_expiry: DateTime.now()
        .plus({ seconds: data.expires_in })
        .toUnixInteger(),
    });
  return [data.access_token, ""];
}

const get_client_token = async (client_id: number): Promise<[string | false, string]> => {
  const client = await Client.query().findOne({ id: client_id });
  if(!client) return [false, "Client not found"];
  if(client.token_expiry > DateTime.now().toUnixInteger() && client.token_value){
    return [client.token_value, "Found token"];
  } 
  const [token, message] = await request_token(client_id);
  return [token, message]
};
export default get_client_token;
