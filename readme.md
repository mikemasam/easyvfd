
### Starting Server (bun is required)
- have bun installed  - https://bun.sh/docs/installation
```curl -fsSL https://bun.sh/install | bash```
- how to start
``` npm start ```

### convert private key to base64
openssl base64 -in key.pem -out key_base64.txt

### extract private and certificate files from pfx
openssl pkcs12 -in yourfile.pfx -out key.pem -nocerts -nodes
openssl pkcs12 -in yourfile.pfx -out cert.pem -nokeys -clcerts
