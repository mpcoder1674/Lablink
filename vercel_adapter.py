"""Adapter that initializes the shared database before a Vercel API request."""

from __future__ import annotations

import threading

from server import LabLinkHandler, init_db


_initialized = False
_initialization_lock = threading.Lock()


def ensure_database() -> None:
    global _initialized
    if _initialized:
        return
    with _initialization_lock:
        if not _initialized:
            init_db()
            _initialized = True


class VercelHandler(LabLinkHandler):
    def _prepare(self) -> bool:
        try:
            ensure_database()
            return True
        except RuntimeError as error:
            self.fail(str(error), 503)
            return False

    def do_GET(self) -> None:
        if self._prepare():
            super().do_GET()

    def do_POST(self) -> None:
        if self._prepare():
            super().do_POST()

    def do_PATCH(self) -> None:
        if self._prepare():
            super().do_PATCH()
