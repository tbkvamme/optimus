← [Tech Stack](../tech-stack.md)

# Infrastructure and Deployment

How code goes from a developer's machine to a running production service: Docker, DigitalOcean App Platform, GitHub Actions.

## Current State

Pre-implementation. The pipeline shape is locked; the actual files (`Dockerfile`, `.do/app.yaml`, GitHub Actions workflows) land in a follow-up implementation plan.

## Containerization: multi-stage Dockerfile

A single `Dockerfile` at the repo root produces one image containing the .NET API plus the built frontend assets. Three stages:

1. **Frontend build (Node).** `node:22-alpine` (or current LTS). Copies `frontend/`, runs `yarn install --immutable` and `yarn build`. Output: `dist/`.
2. **Backend build (.NET SDK).** `mcr.microsoft.com/dotnet/sdk:8.0`. Copies `backend/`, runs `dotnet restore` and `dotnet publish -c Release`. Copies frontend `dist/` from stage 1 into `Optimus.Api/wwwroot/`. Output: published runtime artifacts.
3. **Runtime (.NET ASP.NET).** `mcr.microsoft.com/dotnet/aspnet:8.0`. Copies the published artifacts. Runs as a non-root user. Exposes port 8080. Entrypoint: `dotnet Optimus.Api.dll`.

The container is the unit of deploy — one image, one service. Frontend and backend roll forward and back together.

## Hosting: DigitalOcean App Platform via Container Registry

A single `.do/app.yaml` declares the deployment:

- One **service**: `api`, sized initially at the smallest App Platform instance. Health check at `/health/live`. Source: image from DigitalOcean Container Registry, tag `latest`. `deploy_on_push: enabled` so a new image push triggers redeploy.
- One **database**: PostgreSQL managed by App Platform, dev-tier in MVP. The connection string is injected into the `api` service as the `DATABASE_URL` env var.
- **Env vars and secrets**: configuration values (Auth0 domain, audience, etc.) come from `.do/app.yaml`. Secret values (Auth0 management API client secret, Datadog API key, HMAC signing keys) come from DO Secrets and are referenced from `app.yaml` via `${secret_name}` placeholders.
- **Ingress**: route `/` to `api`. App Platform handles TLS, custom domain, and HTTP/2 termination.

App Platform's YAML is enough for this scale — no Terraform, no Pulumi, no Helm.

## CI/CD: GitHub Actions

Two workflows under `.github/workflows/`:

### `ci.yml` — runs on PR + push to main

- Restores .NET dependencies, builds the solution, runs `dotnet test`.
- Installs frontend dependencies, runs `yarn lint`, `yarn type-check`, `yarn build`.
- No image push, no deploy.
- Status check required before merge.

### `cd.yml` — runs on push to main

- Triggers after `ci.yml` succeeds.
- Logs into DigitalOcean Container Registry using `doctl registry login` (auth via a `DIGITALOCEAN_ACCESS_TOKEN` repo secret).
- Builds the image (same `Dockerfile` as local), tags it `latest` and `${{ github.sha }}`, pushes both tags.
- App Platform's `deploy_on_push` picks up the new `latest` and rolls out the new revision.
- The SHA-tagged image stays in the registry as a rollback target.

A failed `cd.yml` doesn't redeploy production. A failed image push doesn't poison the registry. App Platform's revision history makes rollback a one-click operation.

## Environments

For MVP:

- **Local** — `docker-compose.yml` brings up Postgres on port 5433. Backend runs via `dotnet run` from `backend/src/Optimus.Api/`. Frontend runs via `yarn dev` in `frontend/`. No local container build needed for inner loop; the Dockerfile is exercised by CI/CD.
- **Production** — DO App Platform, the only deployed environment in MVP.

A staging environment is **deferred** until there's a concrete need (business-team UAT before production cutover, complex feature behind a flag, etc.). Adding it later is a copy-paste of the App Platform spec under a new project + a `staging`-branch deploy step in `cd.yml`.

## Secrets management

- **GitHub Actions secrets** hold things needed at build/push time: `DIGITALOCEAN_ACCESS_TOKEN` for DOCR login. Nothing else lives in GitHub.
- **DigitalOcean App Platform secrets** hold runtime values: Auth0 client secret, Datadog API key, HMAC signing key for borrower one-time URLs, anything else the running app needs.
- **Local development** uses User Secrets (`dotnet user-secrets`) for backend and `.env.local` (gitignored) for frontend. Sample template files (`appsettings.Development.json` minus secrets, `frontend/.env.example`) are checked in.
- Nothing secret in the repo. `.gitignore` lists the obvious files.

## Health endpoints

- `GET /health/live` — orchestrator liveness check. Always 200 if the process is alive enough to respond. Wired into `.do/app.yaml`'s health check.
- `GET /health/ready` — readiness check. 200 only if the database is reachable. Used to gate "is this revision actually serving traffic" rather than to keep the container restart-looping.

## Key Decisions & Rationale

### Single image, frontend bundled into API

**Why:** One service to deploy, one URL to operate, no CDN config or cross-origin concerns to wrangle. The cost is that frontend changes redeploy the backend image and vice versa — fine at MVP scale and keeps the "what's in production" question simple.

**How to apply:** Don't reach for a separate frontend service or static-asset bucket unless there's a concrete reason (cache invalidation pain, deploy-cadence mismatch, asset size).

### DigitalOcean App Platform, not Kubernetes

**Why:** App Platform's managed model handles TLS, scaling, rollback, secrets, and health checks for far less operational overhead than running our own orchestrator. Familiarity from prior projects helps too.

**How to apply:** When App Platform stops being enough (multi-region, complex networking, high-cardinality services), revisit. Until then, every infrastructure choice that fits inside `app.yaml` stays inside `app.yaml`.

### App Platform `deploy_on_push` instead of explicit deploy step

**Why:** Pushing the image is the deploy signal. It removes one moving part (an explicit `doctl apps deploy` call) and keeps `cd.yml` minimal. Rollback is "redeploy the previous SHA tag," which is a UI click.

**How to apply:** Don't add an explicit deploy step unless the workflow needs to coordinate something App Platform's auto-deploy can't (e.g., gating on a smoke test that runs before flipping traffic).

## Known Limitations

- The container build runs the full pipeline on every push. Caching strategies (Docker layer cache, BuildKit cache mounts, `actions/cache` for NuGet/yarn) keep build times manageable; expect to revisit these as the project grows.
- Database migrations are not run by `cd.yml` in this design — production migrations are explicit. The implementation plan should document the exact migration step (whether it's a separate workflow, a one-off `doctl` job, or a step before `latest` is tagged).
- Container Registry retention is not configured. DOCR keeps images by default; if storage cost matters, prune old SHA tags via a scheduled workflow.

## Deferred / Future

- Staging environment.
- Blue-green or canary deploy patterns (App Platform supports phased rollouts; not needed yet).
- Custom dashboards in App Platform's metrics UI.
- Multi-region or read-replica Postgres.
- A CDN in front of static assets (only needed if asset size or geographic latency becomes a real issue).

## Cross-References

See also: [tech-stack.md](../tech-stack.md), [application-architecture.md](application-architecture.md), [observability.md](observability.md), [authentication.md](authentication.md).
