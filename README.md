# 🙌 RealWorld example app 🍰 Feature-Sliced Design

> **About this copy.** This is `conduit-web`, the frontend of a three-repo practice system for learning QA
> (`conduit-api`, `conduit-web`, `conduit-qa`). It is a copy of
> [yurisldk/realworld-react-fsd](https://github.com/yurisldk/realworld-react-fsd) (MIT, see `LICENSE`) with its
> tests, test tooling, Git hooks and CI workflows removed, so they can be rebuilt step by step
> (`conduit-qa/ROADMAP.md` has the order). It talks to `conduit-api` on `http://localhost:4000/api` and runs on
> `http://localhost:4100`: `yarn install && yarn generate && yarn start`.

> **Added in this copy**, beyond the RealWorld spec:
>
> - **Roles and moderation.** Moderators and admins get a "Moderation" link in the navbar (`/admin`): a user
>   list with suspend and role controls, an article list with hide and show, and the moderation log. A hidden
>   article shows a notice to its author and to moderators. The rules are in the `conduit-api` README.
> - **Memberships.** `/membership` shows the plans, sends the user to the payment provider's checkout, and
>   afterwards shows the membership with cancel and resume. `/membership/success` is where the provider sends
>   the user back; it waits for the API to hear that the payment went through. Articles can be marked
>   members-only in the editor; non-members see a notice instead of the body. The moderation pages gain
>   memberships and payments, with refunds for admins.
>
> New endpoints are added to `openapi.yaml` by hand; `yarn generate` rebuilds the API client from it.

A modern implementation of the [RealWorld](https://github.com/gothinkster/realworld) app built with React, TypeScript, React Router, React Query, and Zod.

![Realworld example app](./logo.gif)

## About the Project

This project is an educational and demonstration Medium-clone built with the Feature-Sliced Design (FSD) architectural approach and modern frontend tools. It is suitable for learning, experimentation, and as a template for large-scale applications.

![Preview][preview-domain]

## Tech Stack

- **React 19**
- **TypeScript**
- **React Router 7**
- **TanStack React Query 5**
- **Zod 4**
- **Webpack 5**
- **ESLint**
- **Prettier**
- **Sass**
- **Orval**

## Project Structure

- `src/app` — application shell, root router, layout, providers, root error handling
- `src/pages` — page-scoped route modules and page UI
- `src/shared` — reusable API layer, utilities, router helpers, and shared UI

## Architecture Notes

The codebase uses a page-scoped structure rather than a full multi-layer FSD tree.

- The root router is defined in `src/app/browser-router.tsx`.
- Pages expose route objects from `src/pages/*/*.route.ts`.
- Route modules are lazy-loaded to keep the initial bundle smaller.
- Data fetching is handled in route loaders with React Query.
- Mutations are handled in route actions and usually validate `formData` with Zod before calling the API.
- Shared routing helpers, API utilities, and common UI live in `src/shared`.

## Runtime Patterns

- **Lazy route modules**: page components, loaders, and actions are loaded on demand.
- **Route loaders**: async page data is prepared through React Router loaders backed by React Query.
- **Route actions**: form submissions and mutations are handled declaratively through React Router actions.
- **Auth middleware**: route middleware restores the current user and protects auth-only flows.
- **Validation before API calls**: form data is validated with Zod-based helpers before mutations run.
- **Optimistic UI**: interactive actions such as follow and favorite use fetcher-driven optimistic state.
- **Error boundaries**: the root router renders a dedicated fallback for route and auth failures.

## Development Workflow

- Webpack Dev Server is used for local development.
- Generated API code is produced from OpenAPI through Orval and then normalized with a local Zod conversion step.
- Root `Dockerfile` and `nginx.conf` are used for the containerized frontend build.

### Dependency Graph

![Dependency Graph][dependency-graph-domain]

### Bundle Analyze

![Bundle Analyze][bundle-analyze-domain]

## Scripts

- `yarn start` — starts the development server.
- `yarn build:dev` — builds the app in development mode.
- `yarn build:prod` — builds the production bundle.
- `yarn analyze:prod` — builds the production bundle with bundle analyzer enabled.
- `yarn eslint` — lints and auto-fixes files under `src`.
- `yarn prettier` — formats the repository with Prettier.
- `yarn graph` — generates a dependency graph preview for `src`.[^1]
- `yarn generate` — regenerates API artifacts from the OpenAPI schema.
- `yarn zod:mini` — post-processes generated Zod artifacts.
- `yarn format:generated` — formats generated API files.

## Run

Install dependencies:

```bash
yarn install
```

Run locally:

```bash
yarn start
```

- Frontend: `http://localhost:30401`
- Backend API: `http://localhost:30400/api`

[^1]:
    This assumes the GraphViz `dot` command is available - on most linux and
    comparable systems this will be. In case it's not, see
    [GraphViz' download page](https://www.graphviz.org/download/) for instructions
    on how to get it on your machine.

## Docker Compose

Start locally with Docker:

```bash
docker compose --env-file .env.compose up -d --build
```

- Frontend: <http://localhost:30401>
- Backend API is expected separately at <http://localhost:30400>

For backend integration, see [node-express-realworld-example-app](https://github.com/yurisldk/node-express-realworld-example-app).

Stop:

```bash
docker compose --env-file .env.compose down
```

## Deployment

Build image:

```bash
docker build --build-arg API_URL=http://localhost:30400/api -t realworld-frontend .
```

Released images are published to GitHub Container Registry:

```bash
docker pull ghcr.io/yurisldk/realworld:2.1.0
docker pull ghcr.io/yurisldk/realworld:latest
```

Release images are built with `API_URL=http://localhost:30400/api` by default.

[dependency-graph-domain]: ./dependency-graph-preview.svg
[preview-domain]: ./preview.gif
[bundle-analyze-domain]: ./bundle-analyze.png
