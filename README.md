# LabLink

LabLink is a local, browser-based prototype for discovering shared campus lab equipment, requesting project access, and reviewing faculty approvals.

## Run locally

From this folder, start a static server:

```powershell
python -m http.server 5173
```

Then open `http://localhost:5173` in a browser. No install step or API key is required.

## Explore the prototype

- Search and filter a sample resource directory with equipment from several departments.
- Open a resource card to create a project-based access request with a purpose, deadline, training check, and preferred slot.
- Choose a held slot to see a feasible alternative, or use **Find my best slot** to see how the matching preview ranks availability, deadline fit, and recent demand.
- Switch **View as** to Faculty to approve, decline, or request more details for pending sample requests.
- Student requests and faculty decisions persist in this browser through `localStorage`.

All people, labs, requests, and availability in the prototype are illustrative sample data. The matching preview is a transparent, deterministic demo heuristic; no external GenAI service, authentication, booking backend, or campus calendar is connected. Faculty approvals and reservations are simulated in this browser.

## Current scope

The source is now published in a public GitHub repository. Live hosting, Cloud Run deployment, and challenge submission links remain for a later step. The attached participant briefing evaluates code quality, security, efficiency, accessibility, testing, and problem alignment; its submission and deployment steps apply when you are ready to submit.
