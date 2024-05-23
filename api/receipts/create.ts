import { IncomingReceipt } from "#app/receiping/types";
import write_receipt from "#app/receiping/write";
import { dateValidator } from "#lib/utils";
import { FailedResponse, HttpRequest, IHttp, Response, z } from "moonsight";
import { DateTime } from "luxon";

const schema = z.object({
  tin: z.string(),
  issued_date: z.string().refine(dateValidator("yyyy-MM-dd HH:mm:ss"),{
    message: 'Invalid issued date format (yyyy-MM-dd HH:mm:ss)',
  }),
  bill_reference: z.string(),
  bill_receipt: z.string(),
  customer_id: z.string(),
  customer_id_type: z.string(),
  customer_name: z.string(),
  customer_mobile: z.string(),
  items: z.array(
    z.object({
      ref: z.string(),
      desc: z.string(),
      qty: z.number(),
      amount_excl: z.number(),
      amount_tax: z.number(),
      amount_incl: z.number().optional(),
      tax_code: z.enum(["A", "B", "C", "D"]),
    }),
  ),
  payments: z.array(
    z.object({
      ref: z.string(),
      type: z.enum(["CASH", "CHEQUE", "CCARD", "EMONEY", "INVOICE"]),
      amount: z.number(),
    }),
  ),
});

export const index = IHttp(async (req: HttpRequest) => {
  const body: IncomingReceipt = req.utils.parseBody(schema);
  const [result, message] = await write_receipt(body);
  if (!result) return FailedResponse({ message });
  return Response(result, { message: "Ok" });
}, []);
