"""Small API server for LabLink, using local SQLite or hosted PostgreSQL.

Run with: python server.py

The demo deliberately has no login gate. The student/faculty header is a UI
preview switch, not a security boundary; do not use this demo with real student
data or expose it as a production campus service.
"""

from __future__ import annotations

import json
import mimetypes
import os
import re
import sqlite3
import uuid
from contextlib import closing
from datetime import date, datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, unquote, urlsplit

try:
    import psycopg
    from psycopg.rows import dict_row
except ImportError:  # PostgreSQL support is installed only for Vercel deployments.
    psycopg = None
    dict_row = None


ROOT = Path(__file__).resolve().parent
DEFAULT_DB = ROOT / "data" / "lablink.sqlite3"
DB_PATH = Path(os.environ.get("LABLINK_DB_PATH", str(DEFAULT_DB))).expanduser()
DATABASE_URL = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8000"))
MAX_BODY_BYTES = 64 * 1024
STATIC_FILES = {"index.html", "styles.css", "app.js"}
VALID_DURATIONS = {60, 90, 120, 180}
VALID_STATUSES = {"approved", "declined", "needs-info"}

DATABASE_ERRORS = (sqlite3.Error,) + ((psycopg.Error,) if psycopg else ())


class DatabaseConnection:
    """Tiny adapter that keeps the local SQLite and hosted Postgres SQL alike."""

    def __init__(self, raw: Any, postgres: bool) -> None:
        self.raw = raw
        self.postgres = postgres

    def execute(self, statement: str, parameters: Any = ()) -> Any:
        if self.postgres:
            statement = statement.replace("?", "%s")
        return self.raw.execute(statement, parameters)

    def executescript(self, script: str) -> None:
        if not self.postgres:
            self.raw.executescript(script)
            return
        for statement in script.split(";"):
            if statement.strip():
                self.execute(statement)

    def begin_write(self) -> None:
        self.execute("BEGIN" if self.postgres else "BEGIN IMMEDIATE")

    def commit(self) -> None:
        self.execute("COMMIT") if self.postgres else self.raw.commit()

    def rollback(self) -> None:
        if self.postgres:
            self.execute("ROLLBACK")
        else:
            self.raw.rollback()

    def close(self) -> None:
        self.raw.close()


RESOURCE_SEEDS = [
    {
        "id": "jetson", "name": "Jetson Orin Nano dev kit", "model": "8GB edge AI kit · 2 units",
        "category": "AI & computing", "lab": "Applied AI Lab", "location": "Innovation Center · B2.214",
        "access": "Faculty approval", "next": "Today · 12:30 PM", "art": "art-ai", "render": "board",
        "utilization": "41% this week", "fairness": 94,
        "slots": [
            {"day": "Today", "label": "9:30 – 11:00", "open": True, "demand": 24},
            {"day": "Today", "label": "12:30 – 14:00", "open": False, "heldBy": "another team", "demand": 94},
            {"day": "Today", "label": "15:00 – 16:30", "open": True, "demand": 38},
            {"day": "Tomorrow", "label": "10:00 – 11:30", "open": True, "demand": 18},
            {"day": "Tomorrow", "label": "14:00 – 15:30", "open": True, "demand": 46},
        ],
    },
    {
        "id": "printer", "name": "Prusa MK4 3D printer", "model": "FDM printer · 250 × 210 × 220 mm",
        "category": "Fabrication", "lab": "Digital Fabrication Studio", "location": "Engineering Hall · 1.108",
        "access": "Training required", "next": "Today · 3:00 PM", "art": "art-fabrication", "render": "plate",
        "utilization": "67% this week", "fairness": 78,
        "slots": [
            {"day": "Today", "label": "11:00 – 12:30", "open": False, "heldBy": "a course session", "demand": 94},
            {"day": "Today", "label": "15:00 – 16:30", "open": True, "demand": 56},
            {"day": "Tomorrow", "label": "9:00 – 10:30", "open": True, "demand": 28},
            {"day": "Tomorrow", "label": "13:30 – 15:00", "open": True, "demand": 39},
        ],
    },
    {
        "id": "scope", "name": "Digital oscilloscope", "model": "Keysight DSOX1102G · 100 MHz",
        "category": "Electronics", "lab": "Embedded Systems Lab", "location": "Tech Building · C1.306",
        "access": "Open access", "next": "Today · 10:00 AM", "art": "art-electronics", "render": "scope",
        "utilization": "53% this week", "fairness": 88,
        "slots": [
            {"day": "Today", "label": "10:00 – 11:30", "open": True, "demand": 21},
            {"day": "Today", "label": "12:00 – 13:30", "open": True, "demand": 34},
            {"day": "Today", "label": "14:00 – 15:30", "open": False, "heldBy": "a senior design team", "demand": 92},
            {"day": "Tomorrow", "label": "9:30 – 11:00", "open": True, "demand": 22},
        ],
    },
    {
        "id": "thermal", "name": "FLIR thermal camera", "model": "FLIR E8-XT · 320 × 240 thermal sensor",
        "category": "Field & sensing", "lab": "Smart Structures Lab", "location": "Civil Engineering · A2.410",
        "access": "Faculty approval", "next": "Tomorrow · 9:30 AM", "art": "art-bio", "render": "camera",
        "utilization": "36% this week", "fairness": 91,
        "slots": [
            {"day": "Today", "label": "13:00 – 14:30", "open": False, "heldBy": "a lab practical", "demand": 90},
            {"day": "Tomorrow", "label": "9:30 – 11:00", "open": True, "demand": 25},
            {"day": "Tomorrow", "label": "13:00 – 14:30", "open": True, "demand": 35},
        ],
    },
    {
        "id": "testing", "name": "Universal testing machine", "model": "Instron 5967 · 30 kN load frame",
        "category": "Materials", "lab": "Materials Characterization Lab", "location": "Research Annex · G.021",
        "access": "Faculty approval", "next": "Tomorrow · 1:00 PM", "art": "art-materials", "render": "test-machine",
        "utilization": "72% this week", "fairness": 71,
        "slots": [
            {"day": "Today", "label": "14:30 – 16:00", "open": False, "heldBy": "a scheduled materials class", "demand": 98},
            {"day": "Tomorrow", "label": "13:00 – 14:30", "open": True, "demand": 45},
            {"day": "Tomorrow", "label": "15:00 – 16:30", "open": True, "demand": 58},
        ],
    },
    {
        "id": "workstation", "name": "GPU workstation 04", "model": "RTX 4090 · 64GB RAM · Ubuntu",
        "category": "Workstations", "lab": "Visual Computing Suite", "location": "Computing Center · 3.022",
        "access": "Open access", "next": "Today · 11:00 AM", "art": "art-workstation", "render": "monitor",
        "utilization": "58% this week", "fairness": 85,
        "slots": [
            {"day": "Today", "label": "11:00 – 12:30", "open": True, "demand": 27},
            {"day": "Today", "label": "13:00 – 14:30", "open": False, "heldBy": "another student", "demand": 90},
            {"day": "Tomorrow", "label": "9:00 – 10:30", "open": True, "demand": 32},
            {"day": "Tomorrow", "label": "14:30 – 16:00", "open": True, "demand": 41},
        ],
    },
]


def connect_db() -> DatabaseConnection:
    if DATABASE_URL:
        if psycopg is None:
            raise RuntimeError("PostgreSQL support is missing. Install requirements.txt before starting LabLink.")
        raw = psycopg.connect(DATABASE_URL, autocommit=True, row_factory=dict_row, connect_timeout=5)
        return DatabaseConnection(raw, postgres=True)
    if os.environ.get("VERCEL_ENV") == "production":
        raise RuntimeError("Set DATABASE_URL to a persistent PostgreSQL connection for the Vercel production deployment.")
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    raw = sqlite3.connect(DB_PATH, timeout=10, isolation_level=None)
    raw.row_factory = sqlite3.Row
    raw.execute("PRAGMA foreign_keys = ON")
    raw.execute("PRAGMA busy_timeout = 10000")
    return DatabaseConnection(raw, postgres=False)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def init_db() -> None:
    with closing(connect_db()) as conn:
        if not conn.postgres:
            conn.execute("PRAGMA journal_mode = WAL")
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS resources (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                model TEXT NOT NULL,
                category TEXT NOT NULL,
                lab TEXT NOT NULL,
                location TEXT NOT NULL,
                access TEXT NOT NULL,
                next_opening TEXT NOT NULL,
                art TEXT NOT NULL,
                render_style TEXT NOT NULL,
                utilization TEXT NOT NULL,
                fairness INTEGER NOT NULL,
                slots_json TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS project_requests (
                id TEXT PRIMARY KEY,
                student TEXT NOT NULL,
                initials TEXT NOT NULL,
                project TEXT NOT NULL,
                resource_id TEXT NOT NULL REFERENCES resources(id),
                deadline TEXT NOT NULL,
                slot_day TEXT NOT NULL,
                slot_label TEXT NOT NULL,
                duration INTEGER NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('pending','approved','declined','needs-info')),
                purpose TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_request_resource_slot_status
              ON project_requests(resource_id, slot_day, slot_label, status);
            CREATE INDEX IF NOT EXISTS idx_request_student_created
              ON project_requests(student, created_at DESC);
            """
        )
        resource_count = conn.execute("SELECT COUNT(*) AS count FROM resources").fetchone()["count"]
        if resource_count == 0:
            for resource in RESOURCE_SEEDS:
                conn.execute(
                    """INSERT INTO resources
                       (id,name,model,category,lab,location,access,next_opening,art,render_style,utilization,fairness,slots_json)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
                       ON CONFLICT(id) DO NOTHING""",
                    (
                        resource["id"], resource["name"], resource["model"], resource["category"],
                        resource["lab"], resource["location"], resource["access"], resource["next"],
                        resource["art"], resource["render"], resource["utilization"], resource["fairness"],
                        json.dumps(resource["slots"], ensure_ascii=False),
                    ),
                )
        request_count = conn.execute("SELECT COUNT(*) AS count FROM project_requests").fetchone()["count"]
        if request_count == 0:
            today = date.today()
            seeds = [
                ("req-201", "Sam Rivera", "SR", "Thermal response in recycled composites", "thermal", "Tomorrow", "9:30 – 11:00", 90, "approved", "Capture temperature changes during a material stress test."),
                ("req-202", "Sam Rivera", "SR", "Campus mobility prototype", "jetson", "Tomorrow", "14:00 – 15:30", 90, "pending", "Testing a sensor fusion pipeline for our term project."),
                ("req-203", "Noor Ahmed", "NA", "Low-cost river quality sampler", "scope", "Tomorrow", "9:30 – 11:00", 90, "pending", "Validate the analog sensor board before our field trial."),
                ("req-204", "Leo Chen", "LC", "Wearable gait analysis", "thermal", "Tomorrow", "13:00 – 14:30", 90, "pending", "Compare heat distribution during walking trials."),
            ]
            for request in seeds:
                req_id, student, initials, project, resource_id, slot_day, slot_label, duration, status, purpose = request
                # Space demo deadlines across the next few days while keeping them valid on any run date.
                offset = {"req-201": 2, "req-202": 6, "req-203": 3, "req-204": 9}[req_id]
                deadline = date.fromordinal(today.toordinal() + offset).isoformat()
                conn.execute(
                    """INSERT INTO project_requests
                       (id,student,initials,project,resource_id,deadline,slot_day,slot_label,duration,status,purpose,created_at,updated_at)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
                       ON CONFLICT(id) DO NOTHING""",
                    (req_id, student, initials, project, resource_id, deadline, slot_day, slot_label, duration, status, purpose, utc_now(), utc_now()),
                )


def display_deadline(iso_date: str) -> str:
    try:
        return date.fromisoformat(iso_date).strftime("%b %d, %Y").replace(" 0", " ")
    except (TypeError, ValueError):
        return iso_date


def serialize_request(conn: DatabaseConnection, row: Any) -> dict:
    resource = conn.execute("SELECT name, lab FROM resources WHERE id=?", (row["resource_id"],)).fetchone()
    due = date.fromisoformat(row["deadline"])
    days_left = (due - date.today()).days
    return {
        "id": row["id"], "student": row["student"], "initials": row["initials"],
        "project": row["project"], "resourceId": row["resource_id"],
        "resource": resource["name"] if resource else row["resource_id"],
        "lab": resource["lab"] if resource else "Shared campus lab",
        "deadline": display_deadline(row["deadline"]), "deadlineISO": row["deadline"],
        "dueSoon": 0 <= days_left <= 3,
        "slot": f"{row['slot_day']} · {row['slot_label']}",
        "slotDay": row["slot_day"], "slotLabel": row["slot_label"],
        "duration": row["duration"], "status": row["status"], "purpose": row["purpose"],
        "createdAt": row["created_at"],
    }


def get_requests(conn: DatabaseConnection, role: str) -> list[dict]:
    if role == "faculty":
        rows = conn.execute("SELECT * FROM project_requests ORDER BY created_at DESC").fetchall()
    else:
        rows = conn.execute("SELECT * FROM project_requests WHERE student='Sam Rivera' ORDER BY created_at DESC").fetchall()
    return [serialize_request(conn, row) for row in rows]


def request_holds_slot(conn: DatabaseConnection, resource_id: str, day_name: str, label: str, exclude_id: str | None = None) -> Any | None:
    query = """SELECT id, student, status FROM project_requests
               WHERE resource_id=? AND slot_day=? AND slot_label=? AND status IN ('pending','approved')"""
    args: list[str] = [resource_id, day_name, label]
    if exclude_id:
        query += " AND id<>?"
        args.append(exclude_id)
    return conn.execute(query + " ORDER BY created_at LIMIT 1", args).fetchone()


def available_slots(conn: DatabaseConnection, resource_row: Any, exclude_id: str | None = None) -> list[dict]:
    slots = json.loads(resource_row["slots_json"])
    for index, slot in enumerate(slots):
        slot["index"] = index
        holder = request_holds_slot(conn, resource_row["id"], slot["day"], slot["label"], exclude_id)
        if holder:
            slot["open"] = False
            slot["heldBy"] = holder["student"]
        elif slot.get("open"):
            slot.pop("heldBy", None)
    return slots


def serialize_resource(conn: DatabaseConnection, row: Any) -> dict:
    slots = available_slots(conn, row)
    return {
        "id": row["id"], "name": row["name"], "model": row["model"],
        "category": row["category"], "lab": row["lab"], "location": row["location"],
        "access": row["access"], "next": row["next_opening"], "art": row["art"],
        "render": row["render_style"], "utilization": row["utilization"],
        "fairness": row["fairness"], "slots": slots,
        "openCount": sum(1 for slot in slots if slot.get("open")),
    }


def recommend_slot(conn: DatabaseConnection, resource_row: Any, deadline_text: str) -> dict | None:
    try:
        deadline = date.fromisoformat(deadline_text)
    except (TypeError, ValueError):
        deadline = date.today().fromordinal(date.today().toordinal() + 7)
    days_left = (deadline - date.today()).days
    urgent = 0 <= days_left <= 3
    candidates = [slot for slot in available_slots(conn, resource_row) if slot.get("open")]
    if not candidates:
        return None
    today_bonus = 52 if urgent else 22
    for slot in candidates:
        slot["score"] = resource_row["fairness"] - slot.get("demand", 50) + (today_bonus if slot["day"] == "Today" else 0)
    candidates.sort(key=lambda item: (-item["score"], item["index"]))
    winner = candidates[0]
    reason = "Fits before the project deadline and has comparatively low recent demand."
    if urgent and winner["day"] == "Today":
        reason = "Your deadline is close; this is the earliest lower-demand slot still available."
    return {"bestSlot": winner, "alternatives": candidates[1:4], "reason": reason, "daysToDeadline": days_left}


class LabLinkHandler(BaseHTTPRequestHandler):
    server_version = "LabLinkDemo/1.0"

    def log_message(self, fmt: str, *args: object) -> None:
        print(f"{self.log_date_time_string()} {self.address_string()} {fmt % args}")

    def send_json(self, payload: dict, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "same-origin")
        self.end_headers()
        self.wfile.write(body)

    def fail(self, message: str, status: int) -> None:
        self.send_json({"error": message}, status)

    def demo_role(self) -> str:
        role = self.headers.get("X-Demo-Role", "student").strip().lower()
        return role if role in {"student", "faculty"} else "student"

    def read_json_body(self) -> dict:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as exc:
            raise ValueError("Invalid request length.") from exc
        if length < 0 or length > MAX_BODY_BYTES:
            raise ValueError("Request body is too large.")
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ValueError("Send a valid JSON request.") from exc
        if not isinstance(data, dict):
            raise ValueError("Send a JSON object.")
        return data

    def do_GET(self) -> None:
        parsed = urlsplit(self.path)
        path = unquote(parsed.path)
        role = self.demo_role()
        if path == "/api/health":
            self.send_json({"status": "ok", "mode": "demo", "database": "postgresql" if DATABASE_URL else "sqlite", "loginRequired": False})
            return
        if path in {"/api/bootstrap", "/api/resources", "/api/requests"}:
            with closing(connect_db()) as conn:
                resources = [serialize_resource(conn, row) for row in conn.execute("SELECT * FROM resources ORDER BY name").fetchall()]
                requests = get_requests(conn, role)
            payload: dict = {"mode": "demo", "role": role}
            if path != "/api/requests":
                payload["resources"] = resources
            if path != "/api/resources":
                payload["requests"] = requests
            self.send_json(payload)
            return
        if path == "/api/recommendations":
            query = parse_qs(parsed.query)
            resource_id = query.get("resource_id", [""])[0]
            deadline = query.get("deadline", [""])[0]
            with closing(connect_db()) as conn:
                resource = conn.execute("SELECT * FROM resources WHERE id=?", (resource_id,)).fetchone()
                if not resource:
                    self.fail("Resource not found.", 404)
                    return
                result = recommend_slot(conn, resource, deadline)
            self.send_json({"recommendation": result})
            return
        if path.startswith("/api/"):
            self.fail("API route not found.", 404)
            return
        self.serve_static(path)

    def do_POST(self) -> None:
        if urlsplit(self.path).path != "/api/requests":
            self.fail("API route not found.", 404)
            return
        if self.demo_role() != "student":
            self.fail("Switch to the student preview to submit a project request.", 403)
            return
        try:
            data = self.read_json_body()
            project = str(data.get("project", "")).strip()
            purpose = str(data.get("purpose", "")).strip()
            resource_id = str(data.get("resource_id", "")).strip()
            deadline_text = str(data.get("deadline", "")).strip()
            slot_index = int(data.get("slot_index", -1))
            duration = int(data.get("duration", 0))
            if not 1 <= len(project) <= 80:
                raise ValueError("Project name must be between 1 and 80 characters.")
            if not 1 <= len(purpose) <= 300:
                raise ValueError("Project purpose must be between 1 and 300 characters.")
            if duration not in VALID_DURATIONS:
                raise ValueError("Choose a supported session length.")
            if data.get("training") is not True:
                raise ValueError("Confirm your lab safety onboarding before requesting access.")
            deadline = date.fromisoformat(deadline_text)
            if deadline < date.today():
                raise ValueError("Project deadline must be today or later.")
        except (ValueError, TypeError) as exc:
            self.fail(str(exc), 400)
            return

        with closing(connect_db()) as conn:
            try:
                conn.begin_write()
                resource_query = "SELECT * FROM resources WHERE id=?" + (" FOR UPDATE" if conn.postgres else "")
                resource = conn.execute(resource_query, (resource_id,)).fetchone()
                if not resource:
                    conn.rollback()
                    self.fail("Resource not found.", 404)
                    return
                slots = available_slots(conn, resource)
                if slot_index < 0 or slot_index >= len(slots):
                    conn.rollback()
                    self.fail("Choose a valid time slot.", 400)
                    return
                slot = slots[slot_index]
                if not slot.get("open"):
                    suggestion = recommend_slot(conn, resource, deadline_text)
                    conn.rollback()
                    self.send_json({"error": "That slot is no longer available. Choose another open time.", "recommendation": suggestion}, 409)
                    return
                status = "approved" if resource["access"] == "Open access" else "pending"
                request_id = f"req-{uuid.uuid4().hex[:10]}"
                now = utc_now()
                conn.execute(
                    """INSERT INTO project_requests
                       (id,student,initials,project,resource_id,deadline,slot_day,slot_label,duration,status,purpose,created_at,updated_at)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (request_id, "Sam Rivera", "SR", project, resource_id, deadline.isoformat(), slot["day"], slot["label"], duration, status, purpose, now, now),
                )
                row = conn.execute("SELECT * FROM project_requests WHERE id=?", (request_id,)).fetchone()
                response_request = serialize_request(conn, row)
                conn.commit()
            except DATABASE_ERRORS:
                conn.rollback()
                self.fail("The request could not be saved. Please try again.", 500)
                return
        self.send_json({"request": response_request}, 201)

    def do_PATCH(self) -> None:
        path = unquote(urlsplit(self.path).path)
        match = re.fullmatch(r"/api/requests/([A-Za-z0-9-]+)", path)
        if not match and path != "/api/requests":
            self.fail("API route not found.", 404)
            return
        if self.demo_role() != "faculty":
            self.fail("Switch to the faculty preview to review requests.", 403)
            return
        try:
            data = self.read_json_body()
            status = str(data.get("status", "")).strip()
            request_id = match.group(1) if match else str(data.get("id", "")).strip()
            if not re.fullmatch(r"[A-Za-z0-9-]+", request_id):
                raise ValueError("Choose a valid request to review.")
            if status not in VALID_STATUSES:
                raise ValueError("Choose an available review decision.")
        except ValueError as exc:
            self.fail(str(exc), 400)
            return

        with closing(connect_db()) as conn:
            try:
                conn.begin_write()
                request_query = "SELECT * FROM project_requests WHERE id=?" + (" FOR UPDATE" if conn.postgres else "")
                row = conn.execute(request_query, (request_id,)).fetchone()
                if not row:
                    conn.rollback()
                    self.fail("Request not found.", 404)
                    return
                if row["status"] != "pending":
                    conn.rollback()
                    self.fail("This request has already been reviewed.", 409)
                    return
                if status == "approved":
                    resource = conn.execute("SELECT * FROM resources WHERE id=?", (row["resource_id"],)).fetchone()
                    slot_is_contested = request_holds_slot(conn, row["resource_id"], row["slot_day"], row["slot_label"], exclude_id=request_id)
                    if slot_is_contested:
                        conn.rollback()
                        self.fail("That time has been allocated to another request. Ask the student to choose another slot.", 409)
                        return
                    if not resource:
                        conn.rollback()
                        self.fail("The requested resource is no longer available.", 409)
                        return
                conn.execute("UPDATE project_requests SET status=?, updated_at=? WHERE id=?", (status, utc_now(), request_id))
                updated = conn.execute("SELECT * FROM project_requests WHERE id=?", (request_id,)).fetchone()
                result = serialize_request(conn, updated)
                conn.commit()
            except DATABASE_ERRORS:
                conn.rollback()
                self.fail("The review decision could not be saved. Please try again.", 500)
                return
        self.send_json({"request": result})

    def serve_static(self, requested_path: str) -> None:
        relative = requested_path.lstrip("/") or "index.html"
        if relative not in STATIC_FILES:
            self.fail("Not found.", 404)
            return
        candidate = (ROOT / relative).resolve()
        if candidate != ROOT and ROOT not in candidate.parents:
            self.fail("Not found.", 404)
            return
        if not candidate.is_file():
            self.fail("Not found.", 404)
            return
        content = candidate.read_bytes()
        content_type = mimetypes.guess_type(candidate.name)[0] or "application/octet-stream"
        if content_type.startswith("text/") or content_type in {"application/javascript", "application/json"}:
            content_type += "; charset=utf-8"
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "same-origin")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'")
        self.end_headers()
        self.wfile.write(content)


def main() -> None:
    init_db()
    server = ThreadingHTTPServer((HOST, PORT), LabLinkHandler)
    server.daemon_threads = True
    print(f"LabLink demo API serving at http://{HOST}:{PORT}")
    print(f"SQLite data file: {DB_PATH}")
    print("Demo mode has no sign-in. Do not store real student or campus data here.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nLabLink server stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
