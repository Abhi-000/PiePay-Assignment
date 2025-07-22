# PiePay Assignment (Flipkart Offer Engine)
🚀 A backend service that ingests and processes Flipkart payment offers and calculates the highest applicable discount based on user payment details.

## 🧾 Project Overview

This service provides two core capabilities:

1. **Offer Ingestion:**  
   Parses Flipkart’s offer JSON (retrieved manually from the browser network tab) and stores structured offer entries in a database via a POST endpoint.

2. **Discount Calculation:**  
   Accepts user payment details (like bank name, amount, and payment instrument) and returns the highest applicable discount via a GET endpoint.

## 🚀 Live Demo

**Hosted on Railway:**

 - API Base URL: https://piepay-assignment-production.up.railway.app/api
 - Admin UI: https://piepay-assignment-production.up.railway.app/admin
 - Database: PostgreSQL hosted on Railway

🔍 *Note*: A basic frontend interface (`/admin`) was added using AI tools and deployed to simplify evaluation and improve usability. This UI is not part of the assignment scope but included for your convenience.

## ✨ Core Features

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

## 🛠 Tech Stack

This project uses a modern and efficient backend stack focused on rapid development and easy extensibility:

| Layer                 | Technology           | Description                                                               |
|----------------------|----------------------|----------------------------------------------------------------------------|
| **Runtime**          | Node.js              | JavaScript runtime for building scalable backend services                  |
| **Framework**        | Express.js           | Minimal and flexible web framework for Node.js                             |
| **Database**         | PostgreSQL           | Relational database used for storing and querying offers                   |
| **Testing**          | Jest                 | Unit testing framework with support for mocking and isolated logic checks  |
| **Hosting**          | Railway              | Cloud platform used to host the backend with persistent PostgreSQL         |
| **Dashboard**        | HTML/CSS/JavaScript  | Web interface for admin querying and visualization                         |

## 📁 Project Structure

The project is structured for clarity, modularity, and testability:
```plaintext

├──  📂 src/
│──────📂 config/             # Database and environment configuration
|       └──📜 database.js             # PostgreSQL connection configuration
│──────📂 controllers/        # API request handlers
│       ├── 📜offerController.js      # Main API endpoints logic
│       └── 📜adminController.js      # Admin interface controllers
│──────📂 services/           # Core business logic (offer parsing, discount calculation, etc.)
│       └── 📜fferParser.js          # Flipkart response parsing logic
│──────📂 utils/              # Utility functions (e.g., instrument mapping, normalization)
│       ├── 📜discountExtractor.js    # Regex-based discount extraction
│       ├── 📜discountCalculator.js   # Discount calculation utilities
│       └── 📜offerValidation.js      # Offer validation logic
│──────📂 tests/              # Unit tests for discount logic and API
│       ├── 📜discountExtractor.test.js
│       └── 📜discountCalculator.test.js
│──────📂 models/             # Database schema definitions
│       ├── 📜index.js               # Database initialization
│       └── 📜Offer.js               # Database schema and table creation
│──────📂 routes/             # Express route definitions
│       ├── 📜offerRoutes.js         # API routes (/offer, /highest-discount)
│       └── 📜adminRoutes.js         # Admin interface routes
│───📜app.js # Express app setup
├───📜.env # Environment variables
├───📜README.md
├───📜package.json
├───📜flipkart-sample-response.json

```

Each module is isolated for better maintainability and scaling. The services directory holds the core logic, while controllers remain lean and focused on I/O.


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
```json
{
  "highestDiscountAmount": 750,
  "bestOffer": {
    "title": "Flat ₹750 on HDFC Bank Credit Card EMI on 9 months and above tenure. Min Txn Value: ₹10000",
    "adjustmentId": "FPO250704210925MIFUZ",
    "discountType": "FLAT",
    "discountValue": 750,
    "paymentInstruments": ["EMI_OPTIONS"]
  }
}
```
ℹ️ **Note:**  
As per the assignment specification, the expected response format for the discount calculation API is:

```json
{
  "highestDiscountAmount": 500
}
```

This enhancement is added intentionally to help evaluators quickly verify which offer matched the discount logic.
It can easily be removed to strictly adhere to the expected response structure if needed.


## 🚀 Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Git


Follow these steps to run the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/Abhi-000/PiePay-Assignment.git
cd piepay-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a .env file in the root directory and add the following:

```bash
DATABASE_URL="postgresql://postgres:wydDLiYQBHoAWBBRzYBSXahjyZfkDuEY@yamanote.proxy.rlwy.net:51183/railway"
PORT=3000
```

### 4. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```
This will start the backend server on the specified port (default 3000).

### 5.Access the Application
- API Base URL : `http://localhost:3000/api/offers`
- Admin Dashboard : `http://localhost:3000/admin`

## 🔧 Local Database Setup (Optional)

If you prefer not to use the hosted Admin UI and want to run and inspect the PostgreSQL database locally, follow the steps below:

1. Configure Local PostgreSQL Connection
Update your .env file to point to your local PostgreSQL instance:

```bash
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<your_db_name>
```

2. Enable Schema Migration:
To automatically create the required database schema (tables, indexes), uncomment the initDatabase() call inside app.js:
```javascript
   app.listen(PORT, () => {
//   initDatabase(); // ← Uncomment this line
     console.log(`Server is running on port ${PORT}`);
   });
```

- You can also add a local PostgreSQL server to pgAdmin using the following details:
  
   ```bash
   Host Name : yamanote.proxy.rlwy.net
   Port : 51183
   Maintainence Database : railway
   Username : postgres
   Password : wydDLiYQBHoAWBBRzYBSXahjyZfkDuEY
   ```

   
## 🧪 Testing

The project includes comprehensive unit tests for core functionality:

**Test Coverage** : 

 - ✅ Discount extraction from offer summary text
 - ✅ Discount calculation for various offer types
 - ✅ Edge cases and error handling

Run Tests

```bash
# To view just the final result
npm test
#To view detailed test outputs and logs
npx jest --verbose
```


## 🧩 Design Decisions
The following architectural and design decisions were made to ensure correctness, maintainability, and scalability of the system:

### 1. PostgreSQL as Primary Database
- **JSONB Support**: Chosen for robust array operations and flexible JSON storage.
- **Array Columns**: `bank_name[]` and `payment_instruments[]` allow efficient multi-value queries.
- **Unique Constraint**: `adjustment_id` prevents duplicate offers automatically.

### 2. Parsing Strategy
- **Multi-section Parsing**:Extracts offers from both `offer_banners` and `offer_sections`.
- **Data Merging**: Intelligent merging when same offer appears in multiple sections.
- **Regex-based Extraction**: Robust pattern matching for discount information from human-readable text.

### 3. Discount Calculation
- **Field-Based Logic**: Offers are evaluated using structured fields instead of plain text to ensure consistency.
- **EMI & Min Transaction Conditions**: Special conditions like EMI or minimum transaction value are handled modularly.

### 4 Validation Logic
- **Realistic Offer Filtering**: Ignores offers with impossible constraints (e.g., >100% discount)
- **Constraint Validation**: Ensures minimum amounts and maximum discounts are logical.
- **Null Handling**: Graceful handling of missing or null values from Flipkart API.

### 5. Support for Bonus Features
- **Decoupled EMI Logic**: Payment Instruments are handled separately from the base offer model, improving flexibility.
- **Bonus Flexibility**: Extra fields like `emi_months` and `paymentInstruments` are modularly processed to support future enhancements.

### 6. Error Handling
 - **Graceful Degradation**: Invalid offers are skipped without breaking the entire batch.
 - **Detailed Logging**: Comprehensive error logging for debugging
 - **Input Validation**: Strict validation of API inputs with meaningful error messages

### 7. Expanded Response Structure
- **Informative Output**: In addition to the required `"highestDiscountAmount"`, the API returns the full matching offer object.
- **Evaluator Convenience**: Provides immediate visibility into the exact offer used for discount calculation, aiding quick verification.
- **Non-Intrusive Enhancement**: The additional data is included without affecting the core functionality or breaking assignment requirements.

### 8. Modular Code Structure
- Organized by responsibility: `routes/`, `services/`, `utils/`, and `tests/` directories.
- Improves readability and simplifies onboarding and maintenance.

### 9. Frontend and Admin Tools
- **HTML & CSS**: A simple frontend using plain HTML and CSS helps visualize offers without adding frontend frameworks.

### 10. Deployment
- **Railway**: Chosen for quick and simple deployment with built-in PostgreSQL support, enabling faster testing and iteration.


### 🎯 Assumptions

- **Offer Uniqueness**: `adjustment_id` from Flipkart is assumed to be the unique identifier for deduplication.
- **Bank Name Format**: Bank names are stored and queried in uppercase (e.g., `AXIS`, `HDFC`, `SBI`).
- **Amount Format**: All monetary values are considered in Indian Rupees.
- **Offer Priority**: When multiple offers provide the same discount, the newer one (based on `created_at`) is prioritized.
- **Data Persistence**: The original Flipkart API response is preserved in a `JSONB` column (`offer_data`) for reference and potential debugging.
- **EMI Benefits**: EMI offers without explicit discount values are treated as valid, with a default discount of `0`, to ensure they are still evaluated.
- **Flipkart Response Structure**: `flipkart-sample-response.json` is a close approximation of real Flipkart responses, based on analyzing a few samples.
- **Offer Banner vs Section**: `offer_banner` and `offer_section` of the response structure are considered distinct fields and are extracted separately during parsing.
- **Unrealistic Offers**: Offers lacking proper constraints (e.g., a flat discount without a minimum amount) are stored but excluded from discount computation.
- **Unknown Discount Types**: Discount types other than `FLAT`, `PERCENTAGE`, or `UPTO` are ignored during calculation but logged for inspection.
- **Multiple Applicable Offers**: If multiple offers are applicable to the same cart, only the best one (highest discount) is returned.

### 📈 Scaling the `/highest-discount` Endpoint

To handle 1,000 requests per second, the `/highest-discount` endpoint can be scaled using the following strategies:

- **In-Memory Caching**  
  Frequently accessed results can be cached using Redis or similar in-memory stores, significantly reducing database hits.

- **Efficient Querying**  
  - Single query using `ANY()` for array operations instead of running multiple queries.
  - Selective column retrieval to avoid unnecessary data transfer.
  - WHERE clause optimized to filter based on indexed fields first (`bank_name`, `payment_mode`, `min_amount`).
  
- **Input Filtering**  
  Offers with no applicable constraints (e.g., no `min_amount`, `bank_name`, or `payment_mode`) can be skipped during ingestion or preprocessing, reducing noise and improving lookup performance.

- **Horizontal Scaling**  
  The stateless nature of the API allows horizontal scaling using container orchestration tools (e.g., Docker + Kubernetes) behind a load balancer.

- **Connection Pooling**  
  A connection pool ensures efficient usage of database connections, improving performance under load.

- **Preprocessing at Ingestion**  
  All regex-based discount parsing is done at ingestion time, allowing fast and lightweight lookups during the actual request.

### 🚀 Future Improvements

If given more time, the following enhancements would be considered to improve the robustness, scalability, and usefulness of the solution:

- **Batch Discount Calculation Endpoint**  
  Extend support for batch queries, allowing discount calculations for multiple amounts and banks in a single request.

- **Offer Comparison API**  
  Add a dedicated endpoint to compare multiple offers across cards or banks, helping users decide the best payment method.

- **ML-Based Offer Extraction**  
  Integrate ML/NLP pipelines to extract structured offers from raw text or unstructured Flipkart data, reducing reliance on rigid schemas.

- **Real-Time Offer Sync**  
  Implement real-time sync when new offers are added or existing ones are updated:
  - Invalidate relevant caches to prevent stale data
  - Notify connected clients (e.g., admin dashboards or widgets) via WebSockets

- **Graceful Data Migration**  
  Introduce tools to safely evolve the offer schema and migrate historical data without breaking existing logic.

### ⚠️ Known Limitations

- **Heuristic-Based Parsing**: Discount attributes like `maxDiscount`, `minOrderValue`, and `discountType` are currently extracted using pattern matching and summary text heuristics. This works well for known formats but may fail or produce inaccurate results if the structure or phrasing of the summary changes significantly.

### ✅ Conclusion

This assignment demonstrates a robust approach to extracting, storing, and querying discount offers in a scalable and extensible manner. Emphasis was placed on clear data modeling, accurate business logic implementation, and developer-friendly APIs. With additional time, further improvements such as real-time updates, better data pipelines, and advanced discount intelligence can be integrated to make the system production-ready.

## 📝 **License**

This project is created for testing and educational purposes. Not affiliated with PiePay.

## 💬 **Questions?**

For any queries, feel free to reach out! 🚀
 - Email: abhishekhshah2001@gmail.com
 - LinkedIn: https://www.linkedin.com/in/abhishek1201
