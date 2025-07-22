# PiePay Assignment (Flipkart Offer Engine)
🚀 A backend service that ingests and processes Flipkart payment offers and calculates the highest applicable discount based on user payment details.

## 🧾 Project Overview

This service provides two core capabilities:

1. **Offer Ingestion:**  
   Parses Flipkart’s offer JSON (retrieved manually from the browser network tab) and stores structured offer entries in a database via a POST endpoint.

2. **Discount Calculation:**  
   Accepts user payment details (like bank name, amount, and payment instrument) and returns the highest applicable discount via a GET endpoint.

---

## 🚀 Core Features

- ✅ **Offer Ingestion:** Parses Flipkart’s raw offer JSON and stores structured entries in the database.
- ✅ **Discount Calculation:** Calculates the highest applicable discount based on payment details (amount, bank, and payment instrument).
- 🧠 **De-duplication:** Prevents duplicate entries using Flipkart’s `adjustment_id` (a unique identifier in the response).
- 📊 **Conditional Logic Parsing:** Extracts structured data from natural language summaries for precise discount evaluation.
- 📦 **Consistent Responses:** API returns clean, structured outputs for easy integration into frontend apps or other systems.


## 🎁 Bonus Features

- 💳 **Payment Instrument Matching:** Supports filters based on `CREDIT`, `UPI`, and `EMI_OPTIONS`.
- 📉 **EMI Support:** Offers with `emi_months` are also parsed and stored for eligibility matching.


## 🧩 Additional Features

- 🎯 **Admin Dashboard:** Web-based interface to browse offers, inspect tables, and run queries.
- 🧪 **Test Suite:** Comprehensive unit tests for parsing logic and discount computation.
- 🌐 **Production Deployment:** Hosted on [Railway](https://railway.app) with a persistent PostgreSQL database.


---

## 📡 API Documentation

Your server is available at the following structure:

- Base path: `/api` → main offer-related functionality  
- Base path: `/admin` → UI testing utilities


### 1. `POST /api/offer`

Receives Flipkart’s raw offer JSON and stores structured offers into the database.

- **Request Body:**

```json
{
  "flipkartOfferApiResponse": {
    "offer_banners": [...],
    "offer_sections": {
      "PBO": {
        "title": "Partner offers",
        "offers": [...]
      }
    }
  }
}
```
- **Example Payload Snippet:**

```json
{
  "adjustment_sub_type": "PBO",
  "adjustment_id": "FPO250619134128USHPF",
  "summary": "5% cashback on Flipkart Axis Bank Credit Card upto ₹4,000 per statement quarter",
  "contributors": {
    "payment_instrument": ["CREDIT"],
    "banks": ["FLIPKARTAXISBANK"],
    "emi_months": ["0"]
  }
  "display_tags": ["PAYMENT_OPTIONS"],
  "image": "https://img1a.flixcart.com/www/linchpin/fk-cp-pay/axis-78501b36.svg",
  "type": { "value": "non-collapsable" }

}

```
- **Example Response Structure:**
  
```json
{
  "noOfOffersIdentified": 5,
  "noOfNewOffersCreated": 3
}
```

### The API parses summaries like "5% cashback on Flipkart Axis Bank Credit Card up to ₹750" and stores:

- Discount type (Percentage)
- Value (5%)
- Max cap (₹750)
- Bank (Flipkart Axis Bank)
- Payment instrument 
- EMI options (if any)

### 2. `GET /api/highest-discount`

Returns the best discount applicable for a given payment setup.

- Query Parameters:
  - `amountToPay` (required): e.g. `10000`
  - `bankName` (required): e.g. `AXIS` , `FLIPKARTAXISBANK`
  - `paymentInstrument` (optional): e.g. `CREDIT`, `EMI_OPTIONS`

Example:

```
GET /api/highest-discount?amountToPay=12000&bankName=AXIS&paymentInstrument=CREDIT
```

- **Example Response Structure:**
