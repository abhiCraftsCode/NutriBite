# NutriBite client

React + Vite + Tailwind frontend for the existing NutriBite backend.

    cp .env.example .env     # set VITE_API_BASE_URL (default http://localhost:5000/api/v1)
    npm install
    npm run dev              # http://localhost:5173
    npm run build

Areas: public site (/, /menu, /about, /contact, /login, /register), customer (/app/*), admin (/admin/*), delivery partner (/delivery/*).

## Verified against the backend source
All paths, request bodies and response shapes in `src/services/index.js` were checked against the route, validator, controller and service files.

Backend behaviours the UI is built around:
- Food ingredients: `PUT /foods/:id/ingredients` replaces the full list (min 1 item).
- Recipes: no list route. They arrive inside `GET /foods`; `PUT /recipes/:foodId` upserts.
- Categories: `DELETE` is a hard delete (409 if the category has foods); hide a category with `isActive: false`.
- Ingredient create/update accepts only `name` and `unit` (and `isActive`). `reorderLevel` cannot be set through the API.
- Foods list has no pagination; `search` and `categoryId` are the only filters. Admin sees unpublished foods.
- Delivery assignment only works for `READY_FOR_PICKUP` orders and for partners whose `availability` is `AVAILABLE`.
- `GET /delivery` returns all of a partner's deliveries; there is no history route, so history is filtered client-side.
- Reviews and suggestions can only be moderated while `PENDING`.
- Passwords must be at least 8 characters.
- Payment routes return unwrapped bodies (`keyId`, `razorpayOrderId`, ...); a 409 on verify means stock ran out and the server cancelled and refunded the order.
- Delivery fee is currently always 0 on the server.

Known backend limitations: stock restocks never set a food's `isAvailable` back to true (re-enable it in Foods), and there are no password-reset endpoints, so there are no reset pages.
