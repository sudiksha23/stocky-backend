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

{
    "firstName": "Sachin",
    "lastName": "Tayal",
    "email": "sachin@gmail.com",
    "password": "sachin@123"
}

- Success Response: `200 OK`

"User created successfully"

- Error Response: `400 Bad Request`

"Error saving data <error message>"

### Give Reward (grant stock to user)
- Method: `POST`
- Path: `/reward`
- Request (JSON):
```
{
    "userId": "68c190af158d61ac5431b632",
    "symbol": "LALPATHLAB",
    "quantity":1,
    "unitPrice": 3259.00,
    "rewardNote": "Christmas Gift"
}

- Success Response: `200 OK`

"Reward given successfully"

- Error Response: `400 Bad Request`

"<validation error message or some code related error messsage>"

Notes:
- On success, a corresponding double-entry ledger record is created automatically.
- If the `symbol` is new, a `StockHistory` document is created with an empty `priceHistory` array.

### Get Today’s Rewarded Stocks for a User
- Method: `GET`
- Path: `/getStocksForToday/:userId`
  ex. http://localhost:7777/getStocksForToday/68c190af158d61ac5431b632
- Success Response: `200 OK`

{
  "message": "List of all your stocks rewarded for today:",
  "data": [
    { /* Reward document(s) for today with timestamps */ }
  ]
}
ex. {
    "message": "List of all your stocks rewarded for today:",
    "data": [
        {
            "_id": "68c2abeabedbf770435f49d1",
            "userId": "68c190af158d61ac5431b632",
            "symbol": "LALPATHLAB",
            "quantity": "2",
            "unitPrice": "3259",
            "rewardNote": "Diwali Gift",
            "createdAt": "2025-09-11T11:00:58.289Z",
            "updatedAt": "2025-09-11T11:00:58.289Z",
            "__v": 0
        }
    ]
}

### Get User Stats (today + portfolio value)
- Method: `GET`
- Path: `/stats/:userId || example. http://localhost:7777/stats/68c190af158d61ac5431b632
- Success Response: `200 OK`

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


### Get Portfolio (grouped, enriched)
- Method: GET
- Path: /portfolio/:userId || example. http://localhost:7777/portfolio/68c190af158d61ac5431b632
- Success Response: 200 OK
{
    "message": "Hello Naman, Here is you current portfolio",
    "stocks": [
        {
            "name": "Naman Singhal",
            "email": "naman@gmail.com",
            "stockSymbol": "PRESTIGE",
            "quantity": "5",
            "boughtPrice": "966",
            "currentPrice": 1074.4608795748522,
            "currentValue": 5372.304397874261
        }
    ]
}

### Get User Stock History (yesterday + today)
- Method: GET
- Path: /history/:userId ||  http://localhost:7777/history/68c190af158d61ac5431b632
- Success Response: 200 OK
{
    "message": "Stock history for Naman upto yesterday",
    "historyData": [
        {
            "name": "Naman Singhal",
            "email": "naman@gmail.com",
            "stockSymbol": "PRESTIGE",
            "quantity": "5",
            "boughtPrice": "966",
            "stockHistory": [
                {
                    "date": "Thu Sep 11 2025 19:00:00 GMT+0530 (India Standard Time)",
                    "price": "908.8774466312249",
                    "_id": "68c2ced827de1b3f388d1de2"
                }
            ]
        }
    ]
}

Database Schema & Relationships

MongoDB (Mongoose) models:

User
{
  firstName: String (required, minLength 4, maxLength 20),
  lastName: String (required),
  email: String (required, unique, lowercase, trim),
  password: String (required)
}

Reward

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

- **Relationship**: 'Reward.userId' references a 'User' (stored as string and used with '.populate('userId', ...)' in queries).

DoubleEntryLedger
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

- **Relationship**: 'DoubleEntryLedger.rewardId' references a 'Reward' created by '/reward'.

StockHistory

{
  symbol: String (required),
  priceHistory: [ { date: Date|String, price: Number|String } ] // default []
}

- Relationship: Independent collection keyed by 'symbol'. A document is created on first reward for a new symbol.


## Edge Cases, Validation, and Error Handling

- **User creation**:
  - Duplicate 'email' results in a '400' with a Mongo duplicate key error message.
  - 'firstName' length constraints (4–20) enforced by schema.
 
- **Reward creation**:
  - Requires 'userId' and 'symbol'. Quantity defaults to 1 if omitted.
  - Types for numeric fields are currently 'String || Number'; ensure numeric inputs where appropriate to avoid arithmetic issues.
  - On success, creates a 'DoubleEntryLedger' entry and (if needed) initializes a 'StockHistory record for the symbol(stock).

- Date filtering ("today"):
  - Uses UTC boundaries (setUTCHours(0,0,0,0) to setUTCHours(23,59,59,999)). Ensure client expectations align with UTC.

- Missing data :
  - /portfolio and /history assume at least one reward exists; otherwise accessing portfolioData[0] would fail. Callers should be prepared for empty results; future improvement: handle empty portfolios gracefully.

-  Mock prices :
  - Current prices come from a mock service (src/util/hypotheticStockPriceService.tsx), not a real market feed.

- Error responses**:
  - Routes return 400 with raw error messages on validation/persistence failures.

Environment & Configuration

- Port: '7777'

How the system handles edge cases and scaling

- Validation and constraints
    - Mongoose schemas enforce required fields and simple constraints (e.g., user name length, unique email).
     
- Error handling
    - Route-level try/catch; on failure, responds with 400 and the error message (no centralized middleware yet).

- Data integrity side-effects
    - On reward creation, writes a matching double-entry ledger row and ensures a StockHistory doc exists for the symbol.

- Known edge cases and caveats
    - Numeric fields sometimes typed as String || Number; callers should pass numbers to avoid arithmetic issues.
    - Portfolio/history endpoints assume at least one reward; empty results can break string-building on portfolioData[0].
    - “Today” filters use UTC boundaries, so clients should align expectations.

- Background processing
    - Hourly cron updates stock history; runs in-process with the web server.

    