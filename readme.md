# Simplified TRA VFD API

This library provides a simplified TRA VFD API for instant receipt issuing, automated Z-reporting, and persistent storage.

## Table of Contents

- [Description](#description)
- [Requirements](#requirements)
- [Installation](#installation)
- [Starting the Server](#starting-the-server)
- [TIN Registration](#tin-registration)
- [Receipt Posting](#receipt-posting)
- [Response](#response)

## Description

This is a simplified TRA VFD API for instant receipt issuing, automated Z-reporting, and persistent storage.

## Requirements

- [Bun](https://bun.sh/docs/installation) is required to run the server.

## Installation

1. Install Bun:
    ```bash
    curl -fsSL https://bun.sh/install | bash
    ```
2. Install the necessary packages:
    ```bash
    npm install
    ```

## Configuration .env

```.env

PORT=8080
DB_HOST="localhost"
DB_NAME="easyvfd"
DB_USER="root"
DB_PASSWORD="password"

TRA_URL="https://vfdtest.tra.go.tz"
#TRA_URL="https://virtual.tra.go.tz/efdmsRctApi"
TOKEN_URL="vfdtoken"
REGISTER_CLIENT_URL="api/vfdregreq"

POST_RECEIPT_URL="/api/efdmsRctInfo"
POST_ZREPORT_URL="/api/efdmszreport"
```



## Starting the Server

To start the server, use one of the following commands:

```bash
npm start
```
or
```bash
bun index.ts
```

## TIN Registration

Register a TIN using the following command:

```bash
bun index.ts api clients create --certkey=12312 --tin=1231321 --key=data/key.pem --certpath=data/cert.pem
```

## Receipt Posting

To post a receipt, use the following JavaScript example:

```js
const body = () => ({
  tin: "100100224",
  issued_date: "2024-04-01 11:10:09",
  bill_reference: Math.random().toString(),
  bill_receipt: Math.random().toString(),
  customer_id: "131232312",
  customer_id_type: "1",
  customer_name: "123123",
  customer_mobile: "123123",
  items: [{
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
});

await axios.post("http://localhost:8080/api/receipts/create", body()).then(res => {
  console.log(res.data);
});
```

## Response

A successful response will have the following format:

```json
{
  "data": {
    "rctv_num": "21323854",
    "znum": "20240401",
    "tin": "100100224",
    "date": "2024-04-01",
    "time": "11:10:09"
  },
  "status": 200,
  "message": "Ok",
  "success": true
}
```

This documentation provides an overview and detailed steps to set up and use the simplified TRA VFD API. 
