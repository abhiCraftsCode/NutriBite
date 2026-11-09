# NutriBite

**Healthy Food Ordering and Management Platform**

NutriBite is a full-stack food ordering and restaurant management application focused on healthy food, nutritional transparency, and efficient restaurant operations.

The platform allows customers to explore healthy food options, understand their nutritional information, place orders, make online payments, and track deliveries. It also provides an administrative interface for managing food items, ingredients, inventory, orders, and delivery operations.

## Features

### Customer

- User registration and authentication.
- Browse available food items.
- View ingredients, recipes, calories, and nutritional information.
- View allergen information and important food notes.
- Add items to cart and place orders.
- Online payments through Razorpay.
- Track order and delivery status.
- Submit ratings and reviews.
- Suggest new food items and recipes.

### Admin

- Secure administrator authentication.
- Dashboard with order and platform statistics.
- Manage food items and categories.
- Manage ingredients and recipes.
- Manage nutritional information and food availability.
- Manage ingredient inventory.
- View and process customer orders.
- Manage delivery partners and assignments.
- Review customer suggestions and feedback.

### Delivery Partner

- Secure authentication.
- View assigned deliveries.
- Accept delivery assignments.
- Update delivery progress.
- View delivery history.

## Technology Stack

| Component       | Technology        |
| --------------- | ----------------- |
| Frontend        | React + Vite      |
| Styling         | Tailwind CSS      |
| Routing         | React Router      |
| HTTP Client     | Axios             |
| Backend         | Node.js + Express |
| Database        | SQLite            |
| ORM             | Prisma            |
| Authentication  | JWT + bcrypt      |
| Validation      | Zod               |
| Payment Gateway | Razorpay          |

## Architecture

The application follows a modular client-server architecture.

```text
NutriBite/
│
├── client/                 # React frontend
│   ├── public/
│   └── src/
│
├── server/                 # Express backend
│   ├── prisma/             # Prisma schema and migrations
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── utils/
│   ├── .env
│   └── package.json
│
├── .gitignore
└── README.md
```

## User Roles

The application supports three roles:

1. **ADMIN** – Manages the restaurant, catalogue, inventory, orders, and delivery operations.
2. **CUSTOMER** – Browses food, places orders, makes payments, and tracks deliveries.
3. **DELIVERY_PARTNER** – Handles assigned deliveries and updates their status.

Public registration creates customer accounts. Administrator and delivery partner accounts are managed internally.

## Order Workflow

```text
PLACED
   ↓
CONFIRMED
   ↓
PREPARING
   ↓
READY_FOR_PICKUP
   ↓
OUT_FOR_DELIVERY
   ↓
DELIVERED
```

The delivery workflow uses internally managed delivery partners and status-based tracking. External delivery service integrations and GPS tracking are not included in the MVP.

## Payment Integration

NutriBite uses Razorpay Test Mode for online payment processing.

Payment verification is performed by the backend using Razorpay's signature verification mechanism. Secret credentials are stored in environment variables and are never exposed to the frontend.

## Getting Started

### Prerequisites

- Node.js
- npm
- Git
- Razorpay test account (for payment integration)

### Project Setup

Clone the repository:

```bash
git clone <your-repository-url>
cd NutriBite
```

Install frontend and backend dependencies separately:

```bash
cd server
npm install
```

```bash
cd ../client
npm install
```

Refer to the respective project directories for environment configuration and development commands.

### Environment Variables

The backend requires environment variables for:

- Database connection.
- JWT authentication.
- Razorpay credentials.
- Frontend URL.
- Server configuration.

Refer to `server/.env.example` for the required configuration.

## Development

The project is maintained using Git with separate development branches:

- `main` – Integration and stable project version.
- `server` – Backend development.
- `client` – Frontend development.

## Project Scope

The MVP focuses on delivering a complete food ordering workflow, including authentication, food management, inventory, cart, orders, online payments, internal delivery management, reviews, and recipe suggestions.

Future enhancements may include:

- Personalized food recommendations.
- AI-based nutritional analysis.
- Subscription-based meal plans.
- GPS-based delivery tracking.
- External delivery integrations.

## License

This project is developed for academic and educational purposes.
