# LabLink

LabLink is a campus laboratory resource-sharing demo. Students can discover equipment, request project-based access, and receive explainable slot suggestions. Faculty can review pending requests. The Python backend uses SQLite locally and PostgreSQL when deployed to Vercel.

## Run locally

Install Python 3.10 or newer, then open a terminal in this project folder and run:

```powershell
python server.py
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000). Stop the server with `Ctrl+C`. No package installation, API key, or sign-in is required.

The local database is created at `data/lablink.sqlite3` the first time the server starts. To use a different file, set `LABLINK_DB_PATH`. `HOST` and `PORT` can also be set through environment variables; the defaults are `127.0.0.1` and `8000`.

## Features

- Search and filter a sample resource directory with equipment from several departments.
- Create project requests with purpose, deadline, session length, safety onboarding confirmation, and a preferred slot.
- Persist requests and faculty decisions in SQLite, with conflict checks performed inside a write transaction.
- Get a backend slot recommendation ranked by deadline urgency, resource fairness score, and recent demand. The API returns the reason for the recommendation.
- Switch between student and faculty preview modes to explore the student request flow and faculty approval desk.

## API

- `GET /api/health` — backend status and demo mode.
- `GET /api/bootstrap` — resources and requests for the selected demo role.
- `GET /api/resources` — resource catalogue and current availability.
- `GET /api/requests` — requests visible to the selected demo role.
- `GET /api/recommendations?resource_id=jetson&deadline=2026-12-01` — best available slot and alternatives.
- `POST /api/requests` — create a student demo request.
- `PATCH /api/requests` — record a faculty demo decision (`approved`, `declined`, or `needs-info`) with the request ID in the JSON body.

The frontend uses the `X-Demo-Role` header to select `student` or `faculty`. This is a UI preview mechanism only. There is deliberately no login gate so evaluators can try both flows without credentials; the role header is not real authentication or a production security boundary. All people, labs, and starter requests are illustrative. Do not store real student data or expose this demo server to a public network.

The matcher is deterministic and explainable. It does not call an external GenAI service; a provider integration would need to be added separately if the project later requires generative recommendations.

## Prepare a Vercel deployment

The repository includes Vercel Python Functions for the API and serves the existing HTML, CSS, and JavaScript as static files. Python Functions are supported by Vercel; install the project from GitHub and select the **Other** framework preset.

The deployed API requires a persistent PostgreSQL database because Vercel Functions must not depend on a writable local SQLite file. In the Vercel project, add a PostgreSQL provider from **Storage → Marketplace** (Neon is one option) and set its pooled connection string as the production `DATABASE_URL` environment variable. The code also recognizes `POSTGRES_URL`. Keep database credentials in Vercel environment settings; never commit them. Without a database URL, production API requests return a clear configuration error.

After importing the public GitHub repository into Vercel and configuring the database, deploy and open the assigned URL in a private browser window. The student/faculty preview remains available without a sign-in. Vercel deployment itself still requires a Vercel account and project setup.

For local Vercel routing, install the Vercel CLI and run `vercel dev`. The regular local backend continues to run with `python server.py` and SQLite. The matcher is still deterministic and does not call an external GenAI service.
