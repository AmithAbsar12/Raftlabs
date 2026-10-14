# Savory — Order Management

This project is my submission for the RaftLabs Senior Full Stack Developer assessment. I built a full-stack food-delivery order-management application where a customer can browse food, add items to a cart, enter delivery details, place an order, track its progress, and review previous orders.

## Project links

- **Live application:** [raftlabs-eta.vercel.app](https://raftlabs-eta.vercel.app/)
- **GitHub:** [github.com/AmithAbsar12/Raftlabs](https://github.com/AmithAbsar12/Raftlabs)
- **Loom walkthrough:** [RaftLabs assessment walkthrough](https://loom.com/share/folder/d2e3a7af6c0d47b39c88e7212d5a058e)

## What I implemented in the frontend

I used Next.js 16 with React 19 to build the frontend.

On the homepage, I created a responsive food menu. Every food item contains an image, name, description, category, rating, and price. I also added search and category filters so users can find dishes easily.

Users can add items to the cart without interrupting their browsing. The cart opens only when the user clicks the Cart or View Cart button. Inside the cart, users can increase or decrease quantities, remove items, and review the subtotal, tax, delivery charge, and final total.

I created a checkout form that collects:

- Customer name
- Phone number
- Delivery address
- Optional delivery instructions

After a successful order, the user is sent to a tracking page. The tracking page displays the order number, current status, estimated arrival, ordered items, final amount, and delivery address.

I also created an Order History page where users can see their previous orders and reopen the tracking screen for any order.

## How I designed the UI

I used Tailwind CSS 4 together with custom CSS for the visual design.

I designed the application as a customer-facing restaurant experience instead of a generic administration dashboard. I used a warm cream background, orange primary actions, dark-green status colors, rounded cards, original food photography, and clear typography.

The interface includes:

- Responsive desktop and mobile layouts
- Search and category controls
- Menu cards with quantity controls
- Slide-in cart and checkout panel
- Empty-cart and empty-search states
- Form validation and API error messages
- Live order-status cards
- Horizontal delivery progress
- Continuously moving courier indicator
- Delivered-order confirmation popup
- Loading and missing-order states

When an order becomes delivered, I show a completion popup. The customer can return to the homepage or open Order History. If no action is taken, the application automatically returns to the menu. The completed cart is cleared before the user returns.

## What I implemented in the backend

I used Next.js Route Handlers to build the backend REST API in the same application.

The available endpoints are:

| Method   | Endpoint          | What I use it for                                   |
| -------- | ----------------- | --------------------------------------------------- |
| `GET`    | `/api/menu`       | Retrieve all menu items                             |
| `GET`    | `/api/orders`     | Retrieve order history                              |
| `POST`   | `/api/orders`     | Validate and create an order                        |
| `GET`    | `/api/orders/:id` | Retrieve an individual order and its current status |
| `PATCH`  | `/api/orders/:id` | Update delivery details or order status             |
| `DELETE` | `/api/orders/:id` | Cancel an eligible order                            |

I separated the HTTP layer from the business logic. API Route Handlers receive requests and return HTTP responses, while pricing, status changes, validation, and persistence remain inside the `lib` directory.

## How I handled pricing and security

I do not trust prices submitted by the browser. The checkout request contains only menu-item IDs and quantities.

When the backend receives an order, it looks up the trusted menu price and calculates:

- Subtotal
- Delivery fee
- Tax
- Final total

The product name and price are then stored as an order snapshot. This means an existing order remains accurate even if the menu price changes later.

I also added guarded status transitions. For example, an order cannot jump directly from Order Received to Delivered through the update endpoint. Cancellation is allowed only during the early order stages.

## How I implemented validation

I used Zod for server-side request validation.

The backend validates:

- Customer name length
- Complete delivery address
- Phone-number format
- Non-empty cart
- Existing menu-item IDs
- Positive integer quantities
- Maximum quantity limits
- Supported order statuses
- Valid status transitions

The frontend also provides immediate form validation for a smoother experience, but the server remains the final validation boundary.

## How I implemented the database

I used Supabase PostgreSQL for persistent order storage.

The `orders` table stores:

- Order ID
- Human-readable order number
- Customer information
- Ordered products and quantities
- Price snapshots
- Subtotal, delivery fee, tax, and total
- Current status
- Created and updated timestamps

I stored customer and order-item structures using PostgreSQL JSONB. I used database constraints for numeric values and allowed order statuses.

I enabled Row Level Security and removed direct access from public browser roles. Only server-side API Route Handlers use the Supabase secret key. The secret key is stored in environment variables and is never included in frontend code or committed to GitHub.

I also kept an in-memory repository as a fallback for automated tests and local development without Supabase credentials.

## How I implemented real-time order updates

I simulated real-time status changes in the backend using the amount of time elapsed since the order was created.

The order moves through these stages:

```text
Order Received → Preparing → Out for Delivery → Delivered
```

The tracking page polls the order API every three seconds to get the authoritative backend status.

I separated the backend status from the visual courier movement. The backend changes status at defined intervals, while the frontend calculates continuous progress from the creation time. This allows the courier icon to move smoothly instead of jumping only when the status changes.

For this assessment, polling is simpler and more reliable on Vercel than maintaining a WebSocket server. In a larger production application, I could replace it with Server-Sent Events, WebSockets, or a message-based order event system.

## How I structured the project

```text
app/
  api/
    menu/route.js
    orders/route.js
    orders/[id]/route.js
  orders/
    page.js
    [id]/page.js
  globals.css
  icon.js
  layout.js
  page.js
components/
  menu-experience.jsx
  order-tracker.jsx
  orders-history.jsx
lib/
  menu.js
  order-store.js
  order-validation.js
  orders.js
  supabase.js
supabase/
  migrations/001_create_orders.sql
tests/
  api-orders.test.js
  menu-experience.test.jsx
  orders.test.js
```

I used the following separation:

- `app` for pages and REST API routes
- `components` for interactive React UI
- `lib` for validation, business logic, status simulation, and data access
- `supabase` for the PostgreSQL migration
- `tests` for API, domain, validation, and UI tests

## How I tested the application

I used Vitest and React Testing Library.

My tests cover:

- Order creation
- Order retrieval
- Customer-detail updates
- Order cancellation
- Server-side totals
- Invalid customer information
- Empty carts
- Invalid quantities
- Unavailable menu items
- Invalid status transitions
- REST API status codes
- Menu rendering
- Search functionality
- Adding products to the cart
- Manual cart-opening behavior

I also verified the project with ESLint and a full Next.js production build.

```bash
npm test
npm run lint
npm run build
```

## How I used AI

I used AI as a pair-programming and debugging assistant during development.

I used it to:

- Break the assessment into smaller tasks
- Explore architecture and data-model options
- Scaffold parts of the frontend and REST API
- Identify edge cases
- Generate and improve test cases
- Debug Next.js 16 build behavior
- Diagnose Supabase connection and permission errors
- Create the original food image asset
- Improve the delivery-tracking interface

I reviewed the generated code, adjusted it to match the requirements, and verified it using tests, linting, production builds, and manual application testing.

## Challenges I faced

### Persistent orders on Vercel

I initially used in-memory storage because it was allowed by the assessment. However, in-memory data is unreliable across Vercel serverless instances. I solved this by introducing a storage adapter and using Supabase PostgreSQL for persistent orders.

### Supabase permissions

The Supabase table was created successfully, but server operations initially failed because the table did not grant access to the server role. I identified the PostgreSQL permission error and updated the migration with the required server-role CRUD permissions while keeping public roles restricted.

### Smooth courier movement

Initially, the courier moved only when the backend status changed. I improved it by calculating continuous visual progress from the order creation time while keeping the backend as the authoritative source for the actual order status.

## How to run my project locally

Node.js 20.9 or later is required.

```bash
git clone https://github.com/AmithAbsar12/Raftlabs.git
cd Raftlabs
npm install
copy .env.example .env.local
npm run dev
```

Add the following values to `.env.local`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SECRET_KEY=your-server-secret-key
```

Then open [http://localhost:3000](http://localhost:3000).

To create the database, run [`supabase/migrations/001_create_orders.sql`](supabase/migrations/001_create_orders.sql) in the Supabase SQL Editor.

## How I deployed it

I connected the GitHub repository to Vercel and configured these server-side environment variables in the Vercel project:

```text
SUPABASE_URL
SUPABASE_SECRET_KEY
```

Vercel builds and deploys the Next.js application, while Supabase provides persistent PostgreSQL storage.

## What I would improve next

With more time, I would add:

- Customer authentication
- Per-user protected order history
- Admin order-management dashboard
- Payment-provider integration
- Rate limiting
- End-to-end Playwright tests
- Email or push notifications
- WebSocket or Server-Sent Events updates
