# Zonix Rental deployment

The repository contains only `zonixrental` (Spring Boot backend) and `zonixrentalF` (Vite/Electron frontend). Do not commit real environment files, database credentials, API keys, payment credentials, or generated output.

## Before pushing

1. Copy the project to its own repository or initialize Git from this `projectren` directory, not from the parent `Documents` directory.
2. Review `git status --ignored` and confirm that `target`, `node_modules`, `dist`, local environment files, and `application-dev.properties` are ignored.
3. Rotate the database password that was previously present in the old local configuration. It should not be reused.
4. Commit only the two application directories and the repository-level files.

## Backend profiles

- `application-prod.properties` is committed and contains environment variable references only.
- `application-dev.properties` is for local development and is ignored by Git.
- The default profile is `prod`, so deployments fail clearly when required database variables are missing.

For local development, set `DB_PASSWORD` in the shell or a local secret manager, then run:

```powershell
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:DB_PASSWORD = "your-local-password"
./mvnw.cmd spring-boot:run
```

For production, provide these environment variables through the hosting provider's secret settings:

```text
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:postgresql://host:5432/zonix_rental
DB_USERNAME=...
DB_PASSWORD=...
JPA_DDL_AUTO=validate
CORS_ALLOWED_ORIGINS=https://your-project.pages.dev
PORT=8080
```

`DB_URL` must be a JDBC URL beginning with `jdbc:postgresql://`, for example
`jdbc:postgresql://host:5432/zonix_rental`. A provider value such as
`postgresql://host:5432/zonix_rental` must be converted to the JDBC form before it is assigned to `DB_URL`.
If the provider supplies a single `DATABASE_URL`, map its individual connection values to `DB_URL`,
`DB_USERNAME`, and `DB_PASSWORD` in the service environment.

The production profile explicitly uses PostgreSQL. If the dialect error appears again, verify that the
database is reachable from the deployed service and that `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` are
present in the same service that runs the backend.

Build the backend locally with:

```powershell
./mvnw.cmd clean verify
```

A container image can be built from the backend directory:

```powershell
docker build -t zonixrental-api ./zonixrental
docker run --env-file ./zonixrental/.env -p 8080:8080 zonixrental-api
```

Do not commit the `.env` file. Use the hosting provider's secret manager in deployment.

## Frontend

The frontend reads its backend URL from `VITE_API_BASE_URL` at build time. In Cloudflare Pages, open
**Settings > Environment variables**, add this variable for the environment you deploy, and then trigger
a new deployment:

```text
VITE_API_BASE_URL=https://your-backend-host.example.com/api/v1
```

Use the backend's public HTTPS URL and include `/api/v1`. Do not add a trailing slash. For example, a
backend at `https://zonixrental-api.example.com` uses
`https://zonixrental-api.example.com/api/v1`.

The backend deployment must also set `CORS_ALLOWED_ORIGINS` to the exact Cloudflare Pages origin, for example
`https://your-project.pages.dev`. For a custom frontend domain, use that exact `https://` origin instead.
Multiple frontend origins can be comma-separated.

The frontend is currently an Electron/Vite application. Install and build it with:

```powershell
cd zonixrentalF
npm ci
npm run build
```

Set `VITE_API_BASE_URL` before building when the backend is hosted at a separate URL. The frontend's Vite development proxy targets `http://localhost:8080`; production builds use the value embedded at build time.

The current Electron shell loads the Vite development URL, so packaging a desktop installer is a separate later task. The current code is safe to push and can also be served as a Vite static build where appropriate.

## Not configured yet

Payments, application settings, migrations, authentication, CORS policy, and production frontend packaging still need dedicated configuration before exposing the system publicly. Keep those credentials and provider-specific settings in deployment secrets when they are added.
