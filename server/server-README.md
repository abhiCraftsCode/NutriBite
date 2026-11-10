# NutriBite Backend

Backend service for **NutriBite**, a single-restaurant food ordering and management platform.

This directory contains the Node.js/Express API, Prisma ORM configuration, SQLite database setup, authentication, order and payment workflows, inventory management, delivery operations, reviews, suggestions, and admin functionality.

## Technology Stack

- Node.js
- Express.js
- JavaScript (ES Modules)
- SQLite
- Prisma ORM 7
- JWT authentication
- bcryptjs for password hashing
- Zod for request validation
- Razorpay Test Mode for payment integration

## Prerequisites

Install the following before setting up the backend:

- **Node.js:** Use a current Node.js LTS release compatible with the dependencies in `package.json`.
- **npm:** Installed with Node.js.
- **Git:** To clone the repository.

Check your installed versions:

```bash
node --version
npm --version
```

## 1. Install dependencies

Open a terminal in the `server` directory:

```bash
cd server
npm install
```

`package.json` defines the backend dependencies, while `package-lock.json` locks their resolved versions. Do not install backend packages individually unless you are intentionally changing the dependency set.

## 2. Configure environment variables

Create a `.env` file in the `server` directory. Use `.env.example` as the reference:

```bash
cp .env.example .env
```

On Windows PowerShell, you can instead run:

```powershell
Copy-Item .env.example .env
```

Open `.env` and provide the values required by the application.

The configuration includes the following settings (use the exact variable names and defaults present in the checked-in `.env.example` and `src/config/config.js`):

| Setting             | Purpose                                                |
| ------------------- | ------------------------------------------------------ |
| `PORT`              | Port on which the API server listens                   |
| `DATABASE_URL`      | SQLite database connection URL                         |
| `JWT_SECRET`        | Secret used to sign and verify authentication tokens   |
| `JWT_EXPIRES_IN`    | JWT expiry duration                                    |
| `CLIENT_URL`        | Frontend origin allowed by CORS                        |
| Razorpay key ID     | Razorpay Test Mode public key identifier               |
| Razorpay key secret | Razorpay Test Mode secret                              |
| Admin seed settings | Name, email, and password for the seeded admin account |

**Security notes**

- Never commit `.env` or real credentials to Git.
- Keep `.env.example` populated with placeholder values only.
- Use Razorpay Test Mode credentials during development.
- Use a strong, private `JWT_SECRET`; never use a sample value in a deployed environment.
- Do not share the admin seed password or payment secrets.

> Environment variable names are controlled by the project's `.env.example` and configuration module. Keep this table aligned with those files if the configuration changes.

## 3. Set up the database

NutriBite uses SQLite with Prisma ORM 7.

The Prisma configuration is defined in `prisma.config.ts`, and the Prisma schema is located at:

```text
prisma/schema.prisma
```

The generated Prisma Client is configured to be written to:

```text
generated/prisma/
```

After setting `DATABASE_URL` in `.env`, generate the Prisma Client:

```bash
npx prisma generate
```

Apply the project's existing migrations:

```bash
npx prisma migrate dev
```

If the repository does not yet contain an initial migration, create one intentionally:

```bash
npx prisma migrate dev --name init
```

Do not create a new initial migration if migration history already exists. Do not use `prisma db push` as a substitute for the committed migration workflow when setting up a normal development database.

## 4. Seed the admin account

NutriBite uses a private, seeded admin account. Customers register through the application; delivery partner accounts are managed internally by the admin.

Run the seed command configured in `package.json`:

```bash
npm run seed
```

If the repository's `package.json` uses a different seed script name, use that exact script instead. Do not manually create an admin by editing the SQLite database.

Keep the admin credentials in the local `.env` file and change any development credentials before deployment.

## 5. Run the backend

Start the development server using the script defined in `package.json`. In the standard project setup, this is:

```bash
npm run dev
```

If your `package.json` defines a different script, use the script listed under `scripts`.

The API base path is:

```text
/api/v1
```

The full local base URL is determined by `PORT`, for example:

```text
http://localhost:PORT/api/v1
```

Replace `PORT` with the value configured in your `.env` file.

## 6. Production

Build and start commands depend on the scripts defined in `package.json`. This backend uses JavaScript ES Modules and may not require a separate compilation step.

For a production environment:

1. Install dependencies with `npm ci`.
2. Configure production environment variables securely.
3. Ensure the SQLite database location is persistent and writable, or configure the database URL for the intended deployment environment.
4. Apply committed migrations using the deployment-appropriate Prisma migration command.
5. Run the production start script defined in `package.json`.

Do not use development-only commands such as `prisma migrate dev` as the production migration procedure. Use the migration deployment command supported by the project's Prisma setup.

## 7. Main API areas

All API routes are mounted under `/api/v1`.

| API area                  | Base path                  | Purpose                                                       |
| ------------------------- | -------------------------- | ------------------------------------------------------------- |
| Health                    | `/health`                  | Health check                                                  |
| Authentication            | `/auth`                    | Customer registration, login, and current-user authentication |
| Categories                | `/categories`              | Food category operations                                      |
| Foods                     | `/foods`                   | Food catalogue                                                |
| Ingredients               | `/ingredients`             | Ingredient management                                         |
| Recipes                   | `/recipes`                 | Food recipes                                                  |
| Inventory                 | `/inventory`               | Admin stock and stock-movement management                     |
| Addresses                 | `/addresses`               | Customer delivery addresses                                   |
| Cart                      | `/cart`                    | Customer cart                                                 |
| Orders                    | `/orders`                  | Customer order creation and order history                     |
| Payments                  | `/payments`                | Razorpay order creation, verification, and failure reporting  |
| Admin orders              | `/admin/orders`            | Admin order management                                        |
| Delivery partners         | `/admin/delivery-partners` | Admin management of delivery partner accounts                 |
| Admin delivery assignment | `/admin`                   | Assign delivery partners to eligible orders                   |
| Delivery                  | `/delivery`                | Delivery partner delivery operations                          |
| Reviews                   | `/reviews`                 | Customer food reviews                                         |
| Admin reviews             | `/admin/reviews`           | Review moderation                                             |
| Suggestions               | `/suggestions`             | Customer food suggestions                                     |
| Admin suggestions         | `/admin/suggestions`       | Suggestion review                                             |
| Admin dashboard           | `/admin/dashboard`         | Admin dashboard data                                          |
| Account                   | `/account`                 | Profile and password updates                                  |

For exact HTTP methods, nested route paths, request bodies, response envelopes, validation rules, and role permissions, refer to the backend route, validator, controller, and service implementations. Keep any separately maintained API contract documentation synchronized with those files.

## 8. User roles

NutriBite has three application roles:

- **ADMIN:** Manages the catalogue, ingredients, inventory, orders, delivery partners, reviews, suggestions, and dashboard.
- **CUSTOMER:** Registers, browses food, manages addresses and cart, places orders, pays, tracks order status, and submits reviews or suggestions.
- **DELIVERY_PARTNER:** Views assigned deliveries and updates delivery progress.

Customer accounts are self-registered. The admin account is seeded and is not publicly registered. Delivery partner accounts are created by the admin.

## 9. Important implementation notes

- The application is designed for one restaurant, not a multi-restaurant marketplace.
- Monetary values are stored as integer paise. Convert to rupees only for display.
- Order items retain snapshots of food names and prices so historical orders remain meaningful if catalogue data changes.
- Ingredient stock is deducted as part of successful payment verification, not merely when an order is created.
- Payment integration should use Razorpay Test Mode during development.
- Delivery progress is represented through status updates and a timestamped event history; the project does not implement GPS/live-map tracking.
- Protected API routes require a valid JWT and the appropriate role.

## 10. Troubleshooting

### Prisma Client cannot be imported

Regenerate the client:

```bash
npx prisma generate
```

Confirm that the generator output in `prisma/schema.prisma` matches the import used by `src/config/prisma.js`.

### Database or migration errors

- Confirm that `.env` exists in the `server` directory.
- Verify that `DATABASE_URL` is valid for the configured SQLite adapter.
- Run `npx prisma generate`.
- Apply the existing migrations with `npx prisma migrate dev`.
- Check that the process can write to the SQLite database file's directory.

### Frontend requests fail because of CORS

Confirm that `CLIENT_URL` exactly matches the frontend's development origin, including the correct protocol and port.

### Authentication fails

- Confirm that `JWT_SECRET` is set.
- Ensure the client sends the token as a Bearer token.
- Confirm that the account is active and has the required role.

### Razorpay operations fail

- Confirm that both Razorpay Test Mode credentials are set correctly.
- Ensure the frontend uses the matching Test Mode key ID.
- Do not expose the Razorpay key secret to the frontend.

## 11. Useful commands

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Apply development migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Start development server (if defined in package.json)
npm run dev

```

---

**Note for maintainers:** Before release, verify the command names in `package.json`, the environment variable names in `.env.example` and `src/config/config.js`, and the seed script configuration. Update this README whenever those implementation details change.
