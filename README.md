# WorkSphere

A React marketplace with an Express API and MongoDB persistence.

## Marketplace features

- Email/password registration and sign-in with freelancer or client roles.
- Freelancer profiles, public talent search, saved projects, and budget/category/search filters.
- Client project posting, open/paused/filled/closed status management, and proposal review.
- Freelancer bids with cover letters and timelines; accepting one closes other pending bids and marks the project filled.
- Private project conversations after a proposal is accepted or a client invites a freelancer.

Sample listings are read-only. Payments, escrow, identity verification, and real-time message delivery are not part of this MVP.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to your MongoDB connection string and `JWT_SECRET` to a long random secret. Without MongoDB, sample listings remain browsable, but sign-in and write actions return a database-unavailable response.
3. Run `npm run dev` and open the Vite URL shown in the terminal.

The API is available at `http://localhost:5000/api`. `GET /api/projects` lists projects, `POST /api/projects` publishes one when MongoDB is connected, and `GET /api/health` reports service and database status.

## Deploy publicly

Push the repository to GitHub, then deploy in this order:

1. Import the repository into Vercel. It will publish the frontend with sample projects while the API is not configured yet. Copy the Vercel site URL.
2. Create a MongoDB Atlas database. In Render, create a Blueprint from this repository and set `MONGODB_URI` to the Atlas connection string and `CLIENT_ORIGIN` to the Vercel site URL. The included `render.yaml` configures the Express API service.
3. Copy the Render API URL. In Vercel project settings, set the build environment variable `VITE_API_URL` to that URL without a trailing slash, then redeploy.

After redeploy, the Vercel URL is the public app address. Keep the database URI and JWT secret only in Render; never put them in frontend variables. The responsive interface targets current Chrome, Edge, Firefox, and Safari releases. Local development uses the Vite `/api` proxy when `VITE_API_URL` is blank.