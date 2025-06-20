# How M-Pesa STK Push Payment Works in Go

This document explains how to make an M-Pesa STK Push payment using Go, based on the implementation in `payment.go`.

---

## 🔐 1. Get an Access Token
Safaricom uses OAuth 2.0. You must authenticate using your app's consumer key and secret.

### Endpoint
```
GET https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials
```

### Headers
- `Authorization: Basic <base64(consumerKey:consumerSecret)>`
- `Content-Type: application/json`

### Sample Response
```json
{
  "access_token": "your_token_here",
  "expires_in": "3599"
}
```

---

## 📦 2. Construct STK Push Request
Once you have the access token, prepare the payment payload.

### Fields Required
- `BusinessShortCode`: e.g., `"174379"`
- `Password`: base64 of (Shortcode + Passkey + Timestamp)
- `Timestamp`: in format `yyyyMMddHHmmss`
- `TransactionType`: `"CustomerPayBillOnline"`
- `Amount`: e.g., `"100"`
- `PartyA`: sender's phone number
- `PartyB`: shortcode or paybill number
- `PhoneNumber`: same as PartyA
- `CallBackURL`: where Safaricom sends async response
- `AccountReference`: string identifying the transaction
- `TransactionDesc`: e.g., `"chamacontribution"`

---

## 🔐 3. Generate Password

Password is generated using:
```
password = base64Encode(BusinessShortCode + PassKey + Timestamp)
```

---

## 📤 4. Make the HTTP POST Request

### Endpoint
```
POST https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
```

### Headers
- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

### Sample Body
```json
{
  "BusinessShortCode": "174379",
  "Password": "base64encodedpassword",
  "Timestamp": "20250611143000",
  "TransactionType": "CustomerPayBillOnline",
  "Amount": "100",
  "PartyA": "254712345678",
  "PartyB": "174379",
  "PhoneNumber": "254712345678",
  "CallBackURL": "http://localhost:8080/callback",
  "AccountReference": "tujifund",
  "TransactionDesc": "chamacontribution"
}
```

---

## 📥 5. Handle the Response
Safaricom will respond with:

```json
{
  "MerchantRequestID": "...",
  "CheckoutRequestID": "...",
  "ResponseCode": "0",
  "ResponseDescription": "Success. Request accepted for processing",
  "CustomerMessage": "STK Push request sent to phone"
}
```

- Store `CheckoutRequestID`.
- Wait for a callback to your `CallBackURL` for transaction status.

---

## ✅ Production Considerations
- Replace sandbox URLs with production endpoints.
- Securely manage credentials (avoid hardcoding).
- Validate and log all responses.
- Use HTTPS with verified SSL certs.
- Persist `CheckoutRequestID` for reconciliation.

---

## Example Usage in Go
```go
accessToken := FetchAccessToken()
MakePayment(accessToken, "100", "254712345678")
```

---

