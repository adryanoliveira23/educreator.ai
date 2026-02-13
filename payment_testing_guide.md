# Mercado Pago Testing Guide

This guide describes how to test the Mercado Pago integration using the dedicated test route and Sandbox test cards.

## 1. Access the Test Route

A special test route has been created to generate payment links without needing to log in or create a real user account.

**URL:** `http://localhost:3000/api/test/mercadopago`

**Optional Parameters:**

- `plan`: (default: "trial") - The plan to test.
- `email`: (default: "test_user@example.com") - The payer's email.
- `uid`: (default: "test_uid_123") - The user ID to simulate.

**Example Usage:**
Open this URL in your browser:
`http://localhost:3000/api/test/mercadopago?email=mytest@email.com`

**Expected Output:**
You should see a JSON response containing an `init_point` URL:

```json
{
  "success": true,
  "init_point": "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_id=...",
  ...
}
```

## 2. Test the Payment Link

1.  **Copy the `init_point` URL** from the JSON response.
2.  **Open an Incognito/Private window** (to avoid session conflicts if you are logged into your own MP account).
3.  **Paste the URL**. You will be taken to the Mercado Pago checkout page.

## 3. Use Test Cards (Sandbox)

To complete the payment without using real money, you **must use a Test Card**.

**Common Test Cards:**

| Brand      | Card Number        | Name      | Expiration | CVV  | CPF           |
| :--------- | :----------------- | :-------- | :--------- | :--- | :------------ |
| **Visa**   | `4200000000000001` | APRO JOAO | 11/2028    | 123  | `19119119100` |
| **Master** | `5100600000000001` | APRO JOAO | 11/2028    | 123  | `19119119100` |
| **Amex**   | `371111111111111`  | APRO JOAO | 11/2028    | 1234 | `19119119100` |

**Important Notes:**

- **Select "Credit Card"** as the payment method.
- **Name:** Use exactly "APRO" as the first name (e.g., "APRO JOAO") to simulate an approved payment.
  - Use "CONT" (e.g., "CONT JOAO") to simulate a pending payment.
  - Use "CALL" (e.g., "CALL JOAO") to simulate a rejected payment (call for auth).
- **CPF:** You can generate a valid CPF if the one above doesn't work, but usually, MP Sandbox accepts test CPFs.
- **Email:** The checkout might ask for an email. Use a different email than your main Mercado Pago account (e.g., `buyer@testuser.com`).

## 4. Verification

After completing the payment flow:

1.  Mercado Pago should redirect you back to `http://localhost:3000/dashboard?payment=success`.
2.  **Check the logs:** Look at the server console where `npm run dev` is running. You should see logs indicating the webhook was received (if you are running a local tunnel like ngrok) or simply that the payment link was created.
3.  **Verify Webhook (Local Dev):** To fully test the webhook locally, you need a tunnel like `ngrok`.
    - Run `ngrok http 3000`.
    - Configure the Webhook URL in your Mercado Pago Dashboard (Your Integrations -> Webhooks) to point to `https://<your-ngrok-id>.ngrok.io/api/payments/webhook/mercadopago`.
    - Repeat the test steps.
