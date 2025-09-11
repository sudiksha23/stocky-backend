Steps to start server:

-> npm install -g nodemon # or using yarn: yarn global add nodemon
-> npm run dev // for local server start with nodemon
-> npm start  // for normal start using node


## API Specifications

Base URL: `http://localhost:7777`

### Create User
- Method: `POST`
- Path: `/addUser`
- Request (JSON):
```
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "plain-text-for-now"
}
```
- Success Response: `200 OK`
```
"User created successfully"
```
- Error Response: `400 Bad Request`
```
"Error saving data <message>"
```

### Give Reward (grant stock to user)
- Method: `POST`
- Path: `/reward`
- Request (JSON):
```
{
  "userId": "<userId>",
  "symbol": "TCS",
  "quantity": 2.5,
  "unitPrice": 3100,
  "currentPrice": 3185.4,
  "rewardNote": "Great job on Q3"
}
```
- Success Response: `200 OK`
```
"Reward given successfully"
```
- Error Response: `400 Bad Request`
```
"<validation or persistence error message>"
```

Notes:
- On success, a corresponding double-entry ledger record is created automatically.
- If the `symbol` is new, a `StockHistory` document is created with an empty `priceHistory` array.

### Get Today’s Rewarded Stocks for a User
- Method: `GET`
- Path: `/getStocksForToday/:userId`
- Success Response: `200 OK`
```
{
  "message": "List of all your stocks rewarded for today:",
  "data": [
    { /* Reward document(s) for today with timestamps */ }
  ]
}
```

### Get User Stats (today + portfolio value)
- Method: `GET`
- Path: `/stats/:userId`
- Success Response: `200 OK`
```
{
  "message": "User stats fetched successfully.",
  "data": {
    "stocksRewardedToday": {
      "TCS": 6200,   // quantity * unitPrice aggregated per symbol for today
      "CDSL": 1700
    },
    "CurrentINRPortfolioValue": 123456.78  // computed using a mock price service
  }
}
```

### Get Portfolio (grouped, enriched)
- Method: `GET`
- Path: `/portfolio/:userId`
- Success Response: `200 OK`
```
{
  "message": "Hello <FirstName>, Here is you current portfolio",
  "stocks": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "stockSymbol": "TCS",
      "quantity": 5.5,              // aggregated across rewards
      "boughtPrice": 3100,          // from last reward iteration during grouping
      "currentPrice": 3250.12,      // mock current price
      "currentValue": 17875.66
    }
  ]
}
```

### Get User Stock History (yesterday + today)
- Method: `GET`
- Path: `/history/:userId`
- Success Response: `200 OK`
```
{
  "message": "Stock history for <FirstName> upto yesterday",
  "historyData": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "stockSymbol": "TCS",
      "quantity": 5.5,
      "boughtPrice": 3100,
      "stockHistory": [
        { "date": "<yesterday ISO>", "price": 3175.43 },
        { "date": "<today ISO>", "price": 3220.11 }
      ]
    }
  ]
}
```


## Database Schema & Relationships

MongoDB (Mongoose) models:

### `User`
```
{
  firstName: String (required, minLength 4, maxLength 20),
  lastName: String (required),
  email: String (required, unique, lowercase, trim),
  password: String (required)
}
```

### `Reward`
```
{
  userId: String (ref: "User", required),
  symbol: String (required),
  quantity: Number|String (default: 1),
  unitPrice: Number|String,
  currentPrice: Number|String,
  rewardNote: String,
  createdAt: Date,
  updatedAt: Date
}
```

- **Relationship**: `Reward.userId` references a `User` (stored as string and used with `.populate('userId', ...)` in queries).

### `DoubleEntryLedger`
```
{
  rewardId: String (ref: "Reward", required),
  stockSymbol: String (required),
  quantity: Number|String (default: 1),
  totalCashOutflow: Number|String,
  additionFees: {
    brokerage: Number|String,
    stt: Number|String,
    gst: Number|String,
    others: Number|String
  },
  createdAt: Date,
  updatedAt: Date
}
```

- **Relationship**: `DoubleEntryLedger.rewardId` references a `Reward` created by `/reward`.

### `StockHistory`
```
{
  symbol: String (required),
  priceHistory: [ { date: Date|String, price: Number|String } ] // default []
}
```

- **Relationship**: Independent collection keyed by `symbol`. A document is created on first reward for a new symbol.


## Edge Cases, Validation, and Error Handling

- **User creation**:
  - Duplicate `email` results in a `400` with a Mongo duplicate key error message.
  - `firstName` length constraints (4–20) enforced by schema.
  - No password hashing yet; use only in trusted environments.

- **Reward creation**:
  - Requires `userId` and `symbol`. Quantity defaults to `1` if omitted.
  - Types for numeric fields are currently `String || Number`; ensure numeric inputs where appropriate to avoid arithmetic issues.
  - On success, creates a `DoubleEntryLedger` entry and (if needed) initializes a `StockHistory` record for the `symbol`.

- **Date filtering ("today")**:
  - Uses UTC boundaries (`setUTCHours(0,0,0,0)` to `setUTCHours(23,59,59,999)`). Ensure client expectations align with UTC.

- **Missing data**:
  - `/portfolio` and `/history` assume at least one reward exists; otherwise accessing `portfolioData[0]` would fail. Callers should be prepared for empty results; future improvement: handle empty portfolios gracefully.

- **Mock prices**:
  - Current prices come from a mock service (`src/util/hypotheticStockPriceService.tsx`), not a real market feed.

- **Error responses**:
  - Routes return `400` with raw error messages on validation/persistence failures.


## Scaling & Operations

- **Database**:
  - Backed by MongoDB Atlas. Connection is established once at startup.
  - Recommended: move the connection string to an environment variable (e.g., `MONGODB_URI`) and enable IP allowlisting.
  - Add indexes for frequent queries:
    - `Reward`: `{ userId: 1, createdAt: -1 }` for time-bounded lookups
    - `Reward`: `{ userId: 1, symbol: 1 }` for portfolio/history aggregation
    - `StockHistory`: `{ symbol: 1 }`

- **Application server**:
  - Stateless Express service; can be horizontally scaled behind a load balancer.
  - Use a process manager (e.g., PM2) and enable clustering if CPU-bound.
  - Add request logging, rate limiting, and input validation (e.g., `celebrate`/`Joi` or `zod`) for robustness.

- **Background jobs**:
  - A cron (`node-cron`) runs hourly: `updateStockHistory` pushes a new `{date, price}` for each `symbol` in `StockHistory`.
  - For scale, move background jobs to a dedicated worker (e.g., BullMQ + Redis) to avoid duplicate executions across replicas.

- **API evolution**:
  - Add pagination for list endpoints, especially if rewards grow large.
  - Define OpenAPI/Swagger docs to standardize and share the contract.

- **Security**:
  - Store secrets in env vars; do not hardcode credentials.
  - Add password hashing (e.g., `bcrypt`) and authentication/authorization before production use.


## Environment & Configuration

- Port: `7777`
- Cron: hourly stock history update
- DB Connection: configure via env var (recommended)

Example `.env` (recommended):
```
MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority"
PORT=7777
```

And update `src/config/database.tsx` to read from `process.env.MONGODB_URI`.

