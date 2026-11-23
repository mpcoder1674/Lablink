# LabLink

LabLink is a campus laboratory resource-sharing demo. Students can discover equipment, request project-based access, and receive explainable slot suggestions. Faculty can review pending requests. The Python backend stores requests in SQLite.

## Run locally

Install Python 3.10 or newer, then open a terminal in this project folder and run:

```powershell
python server.py
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000). Stop the server with `Ctrl+C`. No package installation, API key, or sign-in is required.

The database is created at `data/lablink.sqlite3` the first time the server starts. To use a different file, set `LABLINK_DB_PATH`. `HOST` and `PORT` can also be set through environment variables; the defaults are `127.0.0.1` and `8000`.

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
- `PATCH /api/requests/{id}` — record a faculty demo decision (`approved`, `declined`, or `needs-info`).

The frontend uses the `X-Demo-Role` header to select `student` or `faculty`. This is a UI preview mechanism only. There is deliberately no login gate so evaluators can try both flows without credentials; the role header is not real authentication or a production security boundary. All people, labs, and starter requests are illustrative. Do not store real student data or expose this demo server to a public network.

The matcher is deterministic and explainable. It does not call an external GenAI service; a provider integration would need to be added separately if the project later requires generative recommendations.

## GitHub Pages

GitHub Pages only hosts static files and cannot run this Python API. Run the complete app with `python server.py`, or deploy the backend to a Python-capable host and configure the frontend to use that API before publishing the static site.
