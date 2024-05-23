
### Starting Server (bun is required)
- have bun installed  - https://bun.sh/docs/installation
```curl -fsSL https://bun.sh/install | bash```
- install packages
``` npm install```
- how to start
``` npm start ```
or 
``` bun index.ts```




### TIN registration

```
bun index.ts api clients create --certkey=12312 --tin=1231321 --key=data/key.pem --certpath=data/cert.pem
```
### Receipt Posting
````JS
body = () => ({
  tin: "100100224",
  issued_date: "2024-04-01 11:10:09",
  bill_reference: Math.random().toString(),
  bill_receipt: Math.random().toString(),
  customer_id: "131232312",
  customer_id_type: "1",
  customer_name: "123123",
  customer_mobile: "123123",
  items:[{
    ref: "item_1",
    desc: "item 1",
    qty: 1,
    amount_excl: 10000,
    amount_tax: 1800,
    tax_code: `A`,
  }],
  payments: [{
    ref: "qerq",
    type: "CASH",
    amount: 11010
  }]
})
await axios.post("http://localhost:8080/api/receipts/create", body()).then(res => {
  console.log(res.data);
})
```
#### Response
```json
{ data: true, status: 200, message: 'Ok', success: true }
```
