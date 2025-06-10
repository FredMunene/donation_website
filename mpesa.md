# M-Pesa Daraja Integration Guide

## Overview

This guide focuses on integrating the following M-Pesa Daraja services:

- Authentication
- STK Push (Lipa na M-Pesa Online Payment)
- STK Push Query
- C2B (Customer to Business) Payment Confirmation

---

## 1. Authentication

### Endpoint:

```
GET https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials
```

### Usage:

- Use **Basic Auth** with:
  - Username: `consumerKey`
  - Password: `consumerSecret`
- Returns an access token valid for 1 hour.

### Recommendation:

Implement a reusable `getAccessToken()` function that caches the token and fetches a new one only when expired.

---

## 2. STK Push (Lipa na M-Pesa Online Payment)

### Endpoint:

```
POST https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
```

### Sample Payload:

```json
{
  "BusinessShortCode": "174379",
  "Password": "Base64(BusinessShortCode + Passkey + Timestamp)",
  "Timestamp": "yyyyMMddHHmmss",
  "TransactionType": "CustomerPayBillOnline",
  "Amount": "100",
  "PartyA": "2547XXXXXXXX",
  "PartyB": "174379",
  "PhoneNumber": "2547XXXXXXXX",
  "CallBackURL": "https://yourdomain.com/api/mpesa/callback",
  "AccountReference": "Invoice001",
  "TransactionDesc": "Payment for order #001"
}
```

### Implementation:

- Expose a route like `POST /api/pay` that builds and sends the request.
- Return the `CheckoutRequestID` for tracking.

---

## 3. STK Push Query

### Endpoint:

```
POST https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query
```

### Sample Payload:

```json
{
  "BusinessShortCode": "174379",
  "Password": "Base64(BusinessShortCode + Passkey + Timestamp)",
  "Timestamp": "yyyyMMddHHmmss",
  "CheckoutRequestID": "ws_CO_123456789"
}
```

### Implementation:

- Create a GET route like `/api/payment-status/:checkoutRequestID` to check payment status manually.

---

## 4. C2B (Customer to Business) Payment Confirmation

### Step 1: Register URLs

#### Endpoint:

```
POST https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl
```

#### Sample Payload:

```json
{
  "ShortCode": "600000",
  "ResponseType": "Completed",
  "ConfirmationURL": "https://yourdomain.com/api/mpesa/confirmation",
  "ValidationURL": "https://yourdomain.com/api/mpesa/validation"
}
```

### Step 2: Callback URLs

- `POST /api/mpesa/confirmation`: Updates your records with the transaction details.
- `POST /api/mpesa/validation`: (Optional) Accepts or rejects payment before confirmation.

### Step 3: Simulate Payments

```
POST https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate
```

---

## Suggested Endpoint Structure

| Method | Path                              | Purpose                       |
| ------ | --------------------------------- | ----------------------------- |
| GET    | `/api/token`                      | (Optional) Get token manually |
| POST   | `/api/pay`                        | Initiate STK Push             |
| GET    | `/api/payment-status/:checkoutID` | Query STK Push status         |
| POST   | `/api/mpesa/callback`             | STK Push payment result       |
| POST   | `/api/mpesa/confirmation`         | C2B payment confirmation      |
| POST   | `/api/mpesa/validation`           | C2B payment validation        |
| POST   | `/api/register-urls` *(optional)* | Register confirmation URLs    |

---

## Security Best Practices

- Use HTTPS for all endpoints.
- Validate webhook data (e.g., confirm transaction IDs, amount).
- Use environment variables to manage secrets and keys.
- Log all interactions for auditing and debugging.

---

## Next Steps

1. Register your confirmation and validation URLs in sandbox.
2. Build the STK Push flow with status tracking.
3. Test C2B payments via simulation.
4. Apply for production access via Safaricom dashboard.

---

> For more details, visit: [Safaricom Developer Portal](https://developer.safaricom.co.ke/Documentation)

