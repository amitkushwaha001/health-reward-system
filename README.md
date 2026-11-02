# Health Rewards

**Make every step count.** Health Rewards is a full-stack wellness and rewards platform that turns manually logged daily movement into a simple progress journey. People can record steps, see how their activity adds up, earn a cash-denominated reward balance, and browse rewards, while administrators manage the reward catalog and keep an eye on platform activity.

The project brings together a React web app, an Express REST API, and MongoDB. Its goal is to make everyday movement feel more motivating: a user logs activity, earns ₹0.10 for each logged step, follows progress in their dashboard, and decides whether to redeem their balance from the available catalog. Admin tools provide a separate, role-restricted workspace for users, rewards, and reports.

<p align="center">
  <img src="docs/assets/health-rewards-overview.svg" alt="Illustration of the Health Rewards journey: log movement, earn reward balance, and explore rewards" width="100%">
  <img width="1888" height="862" alt="image" src="https://github.com/user-attachments/assets/30ab695b-6826-44b9-a7ac-b664e3d01de5" />
  <img width="1910" height="867" alt="image" src="https://github.com/user-attachments/assets/bc3f4aed-f3a2-4983-91ac-5e64a08978b3" />
  <img width="1892" height="866" alt="image" src="https://github.com/user-attachments/assets/f31b69b2-a473-4762-bd8c-2445f8778042" />



</p>

> **Illustration, not a product screenshot.** The visual above summarizes the app's movement-to-rewards flow.

## Project description

Health Rewards is designed for people who want a lightweight way to connect activity tracking with a reward goal. It does not automatically collect steps from a phone, watch, or external health service: users enter their step records in the app. Those records feed personal summaries and a rupee-denominated balance, and users can explore the catalog and track their redemption history.

The application also includes activity insights, recommendations, and a chat-style assistant based on in-app records. These features are informational, not medical advice; projections are estimates, and the assistant does not redeem rewards or change account settings. Admin-only pages provide tools for managing users and rewards and viewing reports.

### User journey

1. **Create an account and sign in.** User and admin experiences are role-restricted.
2. **Log daily steps.** Add a record and review or update step history.
3. **Follow progress.** Check earnings, activity analytics, leaderboard placement, and available balance.
4. **Choose a reward.** Browse available rewards, redeem from your balance, and review redemption history.
5. **Review wellness guidance.** Explore activity-based insights and recommendations at your own discretion.

### Feature overview

| Area | Description |
| --- | --- |
| Activity tracking | Record daily step counts and review, edit, or delete entries. |
| Reward balance | Earn ₹0.10 for each logged step by default. Rewards and balances use paise internally to keep currency calculations exact. |
| Rewards | Browse the active catalog, redeem an eligible reward, and check past redemptions. |
| Progress | View dashboard summaries, rupee-denominated activity analytics, and leaderboard rankings. |
| Wellness guidance | Review activity-based insights, recommendations, and chat responses; informational only. |
| Administration | Manage users and rewards, view dashboard statistics, and access reports. |

### Earning rate

The default earning rate is **1 step = 10 paise**, so **100 steps = ₹10** and **1,000 steps = ₹100**. The backend stores balances and reward costs as integer paise and converts them to rupees in the app. The app rewards the exact number of steps entered; it does not verify steps with a phone or wearable.

On startup, existing legacy balances, step earnings, reward prices, and redemption records are converted from points to paise once while preserving their existing rupee value. The earning rate is defined in backend configuration and is not an environment-variable setting.

## Technology

| Area | Stack |
| --- | --- |
| Frontend | React 18, React Router, Axios, Chart.js |
| Backend | Node.js, Express, Mongoose |
| Data | MongoDB |
| Authentication | JSON Web Tokens and bcryptjs |

## How it fits together

```text
React app (frontend/) ── REST API ── Express app (backend/) ── MongoDB
                                      ├── Authentication and user profiles
                                      ├── Steps, balances, rewards, and redemptions
                                      ├── Leaderboard and activity analytics
                                      ├── Admin operations
                                      └── Insights, recommendations, and chat
```

```text
.
├── backend/                 # API, models, business logic, and tests
├── frontend/                # React application
├── docs/                    # Setup, architecture, and development guides
│   └── assets/              # README illustration
├── k8s/                     # Kubernetes manifests
├── nginx/                   # Nginx configuration
├── docker-compose.yml       # Container orchestration
└── .github/workflows/       # CI and repository workflows
```

## Run locally

### Prerequisites

- Node.js 20 (the version used by CI) and npm
- MongoDB, local or hosted, with a database available to the backend

### 1. Configure and start the backend

```bash
cd backend
npm ci
```

Copy `backend/.env.example` to `backend/.env`, then set the required `MONGODB_URI` and a private `JWT_SECRET` of at least 32 characters. Keep `.env` local and never commit real credentials.

```bash
npm run dev
```

The backend listens on port 5000 by default.

### 2. Configure and start the frontend

In another terminal:

```bash
cd frontend
npm ci
```

Set `REACT_APP_API_BASE_URL` in the frontend's local environment to point to your backend API, then run:

```bash
npm start
```

Open the frontend at `http://localhost:3000`.

### Optional demo data

`backend/seed.js` is an opt-in development utility that **deletes and recreates** the demo users, steps, and rewards collections. Only use it with a disposable local development database, never with production or real user data. It requires `NODE_ENV=development` and `SEED_DEMO_DATA=true`; see [Environment setup](docs/ENVIRONMENT_SETUP.md) before running it. No demo passwords are published in this README.

On its first startup, the backend adds the starter reward offers to the catalog once. They are sample offers: redeeming one spends reward balance and creates a tracking code, but does not issue real cash, book travel, or deliver a third-party voucher. Administrators can manage or deactivate offers from the admin rewards page.

## API overview

The API is mounted under `/api`. Main route groups:

| Route | Purpose |
| --- | --- |
| `/api/auth` | Registration, login, and authentication profile |
| `/api/user` | User profile and password management |
| `/api/steps` | Step entry and history |
| `/api/rewards` | Reward catalog, redemption, and redemption history |
| `/api/leaderboard` | Rankings and user rank |
| `/api/analytics` | Activity analytics |
| `/api/admin` | Admin dashboard, users, rewards, and reports |
| `/api/ai` | Insights, recommendations, and chat |

See the [setup guide](docs/SETUP_GUIDE.md) for additional API and configuration details.

## Tests and CI

Run the project checks from their respective directories:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test -- --watchAll=false

# Frontend production build
npm run build
```

The GitHub Actions workflow runs backend and frontend tests and builds the frontend; pull requests to `main` also run dependency review. There is no separate frontend lint script configured.

## Deployment assets

The repository includes Docker Compose, Nginx configuration, and Kubernetes manifests. These are deployment assets, not a guarantee of a configured hosted deployment: review their settings, provide the required environment configuration and MongoDB service, and verify them in your own environment before use.

## Contributing

1. Create a focused branch and make your change.
2. Run the relevant backend tests, frontend tests, and build.
3. Open a pull request with a concise description and verification notes.

For code conventions and workflows, see the [development guide](docs/DEVELOPMENT_GUIDE.md). For system structure, see [architecture](docs/ARCHITECTURE.md).

## Possible next steps

Ideas for future work—not features currently promised here—include wearable integrations, notifications, and additional analytics.
