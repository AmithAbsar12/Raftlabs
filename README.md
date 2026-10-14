# Savory — Order Management

A full-stack food delivery ordering experience built for the RaftLabs Senior Full Stack Developer assessment. Customers can explore a responsive menu, manage quantities, checkout with validated delivery details, and follow a simulated live order timeline.

## Features

- Responsive, searchable menu with category filters and original food photography
- Cart with quantity controls, removal, totals, tax, and free-delivery threshold
- Accessible checkout form with client and server validation
- Server-authoritative menu prices and order totals
- Live order status progression: received → preparing → out for delivery → delivered
- Delivery-complete confirmation with automatic return to the menu
- Order history screen for reviewing and reopening previous orders
- REST API with order CRUD behavior and guarded status transitions
- Unit, validation, and React component tests
- Loading, empty, error, and mobile states

## Run locally

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run lint
npm run build
```

## REST API

| Method   | Endpoint          | Purpose                             |
| -------- | ----------------- | ----------------------------------- |
| `GET`    | `/api/menu`       | List menu items                     |
| `GET`    | `/api/orders`     | List orders                         |
| `POST`   | `/api/orders`     | Validate and place an order         |
| `GET`    | `/api/orders/:id` | Retrieve an order and latest status |
| `PATCH`  | `/api/orders/:id` | Update delivery details or status   |
| `DELETE` | `/api/orders/:id` | Cancel an eligible order            |

Example order body:

```json
{
  "customer": {
    "name": "Alex Morgan",
    "address": "24 Market Street, Springfield",
    "phone": "+1 555 123 4567",
    "instructions": "Ring the bell"
  },
  "items": [{ "menuItemId": "margherita", "quantity": 2 }]
}
```

## Architecture and design choices

Next.js App Router provides both the React application and standards-based Route Handlers. HTTP concerns remain in `app/api`, business logic is isolated in `lib`, and interactive UI lives in `components`. Zod schemas act as the validation boundary. Prices are looked up on the server and snapshotted into orders; the client cannot submit its own price.

Status updates are intentionally simulated on the server from elapsed order time and polled by the tracking screen every three seconds. This is deterministic, easy to demonstrate, and avoids WebSocket infrastructure for an assessment. Production could replace polling with Server-Sent Events or a message-backed WebSocket gateway.

Orders use Supabase PostgreSQL whenever the required server credentials are configured. A process-level in-memory repository remains available for tests and zero-configuration local development. The browser never receives the Supabase service role key; all database access goes through server-side Route Handlers.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, create a new query, and run [`supabase/migrations/001_create_orders.sql`](supabase/migrations/001_create_orders.sql).
3. In **Project Settings → API Keys**, copy the Project URL and a server-side `secret` key. A legacy `service_role` key also works.
4. Copy `.env.example` to `.env.local` and insert those values:

## Testing strategy

Vitest covers order creation, retrieval, update, cancellation, server-side totals, validation failures, unavailable products, and invalid status transitions. React Testing Library covers menu rendering, search, add-to-cart, and cart UI behavior.

## Project structure

```text
app/
  api/menu/route.js
  api/orders/route.js
  api/orders/[id]/route.js
  orders/[id]/page.js
  page.js
components/
  menu-experience.js
  order-tracker.js
lib/
  menu.js
  orders.js
  order-validation.js
tests/
  menu-experience.test.jsx
  orders.test.js
```

## AI usage

AI was used as a pair-programming tool to translate the brief into a domain model, scaffold API and UI code, explore edge cases, generate test cases, debug build feedback, and create the original food image sheet. All architecture choices, generated code, and tests were reviewed against the assignment requirements.

## Deployment

Deploy directly to Vercel after connecting the GitHub repository. Add `SUPABASE_URL` and `SUPABASE_SECRET_KEY` to the Vercel project’s Environment Variables before deploying. The same Supabase database then supports durable order tracking and history across serverless instances.
