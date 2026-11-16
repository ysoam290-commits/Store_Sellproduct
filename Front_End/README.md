# NIT Electronics Store Frontend

Responsive React 18 + Vite storefront and admin console for the existing Spring Boot API. Built with JavaScript, Tailwind CSS, React Router, Axios, React Hook Form, Zod, Lucide, and React Hot Toast.

## Run locally

The backend in this workspace listens on port `8082` by default. Configure the frontend with:

```env
VITE_API_BASE_URL=http://localhost:8082
```

Copy `.env.example` to `.env` if needed, then run:

```sh
npm install
npm run dev
npm run build
```

The Axios client adds the stored JWT as a Bearer token, unwraps the backend `ApiResponse.data` envelope, redirects expired sessions to login, and reports network/authorization errors. Product images are loaded from the backend `/uploads/{filename}` mapping.

## API integration

| API | Implemented operations | Access |
|---|---|---|
| `/api/auth` | `POST /login`, `/register`, `/forgot-password`, `/reset-password` | Public |
| `/api/products` | `GET /`, `GET /{id}`, `GET /filter`, `POST /`, `PUT /{id}`, `DELETE /{id}` | Reads public; writes `ADMIN` |
| `/api/categories` | `GET /`, `GET /{id}`, `GET /filter`, `POST /`, `PUT /{id}`, `DELETE /{id}` | Authenticated |
| `/api/brands` | `GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}` | Authenticated |
| `/api/roles` | `GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}` | `ADMIN` |

Product creation sends multipart form data with an `image` part and the backend's `ProductRequest` fields. Product update is JSON and does not upload a replacement image. Product filtering uses the backend query spelling `categotyId`. Product listing pagination, price filters, sorting, and search are performed in the browser because the product API returns an unpaged list. Category filtering uses the backend `PageResponse` format.

Authentication stores the access token and returned account/role data in browser local storage. Access tokens last 10 minutes; the backend issues a 7-day refresh token but does not provide a refresh endpoint, so an expired session must sign in again. Role checks in the UI improve navigation only; the backend remains responsible for authorization.

## Current backend limits

- The cart is local to this browser and persists in local storage.
- There are no order or payment APIs. Checkout explains this limitation and does not create a pretend order or charge.
- There are no user listing, user administration, or profile update APIs. Those screens do not send requests to guessed endpoints.
- Product data contains name, quantity, price, status, description, image, brand, and category; it has no rating, review, warranty, or technical specification fields.
- Roles can be listed and managed, but the backend has no permission catalog endpoint. Existing permissions are displayed; the UI does not invent permission records.
- Spring Security currently requires `ADMIN` for product writes and role routes. Category and brand writes are only covered by the general authenticated rule, so backend authorization should be tightened if those operations are intended to be admin-only.

No backend source files are changed by this frontend project.
