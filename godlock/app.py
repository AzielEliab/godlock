"""FastAPI app for the GodLock core. Default bind is 127.0.0.1.

Localhost research tool: POST /merge is unauthenticated on purpose.
Do not expose this process on a public interface without your own auth
in front. This repo is not an anonymity network.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse, Response
from fastapi.templating import Jinja2Templates

from godlock.config import DEFAULT_BIND_HOST, DEFAULT_BIND_PORT, HONEST_BANNER, MOTTO
from godlock.engine import GodLockEngine
from godlock.receipts import ImmutableReceiptError

TEMPLATE_DIR = Path(__file__).resolve().parent / "templates"
templates = Jinja2Templates(directory=str(TEMPLATE_DIR))


def create_app(
    engine: GodLockEngine | None = None,
    persist: bool = True,
    data_dir: str | Path | None = None,
    bind_host: str = DEFAULT_BIND_HOST,
    bind_port: int = DEFAULT_BIND_PORT,
) -> FastAPI:
    """Application factory. Default bind host is 127.0.0.1 (localhost only)."""
    eng = engine or GodLockEngine(data_dir=data_dir, persist=persist)
    app = FastAPI(
        title="GodLock",
        version="0.1.0",
        description=HONEST_BANNER,
    )
    app.state.engine = eng
    app.state.bind_host = bind_host or DEFAULT_BIND_HOST
    app.state.bind_port = int(bind_port)

    def _dashboard(
        request: Request,
        result: dict[str, Any] | None = None,
        doctor: dict[str, Any] | None = None,
        import_result: dict[str, Any] | None = None,
        error: str | None = None,
    ) -> HTMLResponse:
        stats = eng.stats()
        return templates.TemplateResponse(
            request,
            "dashboard.html",
            {
                "motto": MOTTO,
                "banner": HONEST_BANNER,
                "counter": stats["counter"],
                "resilience_score": stats["resilience_score"],
                "rules": stats["rules"],
                "grid_nodes": stats["grid_nodes"],
                "recent_ids": stats["recent_receipt_ids"],
                "rule_list": [r.as_dict() for r in eng.rules.all()],
                "result": result,
                "doctor": doctor,
                "import_result": import_result,
                "error": error,
            },
        )

    @app.get("/", response_class=HTMLResponse)
    def dashboard(request: Request) -> HTMLResponse:
        return _dashboard(request)

    @app.get("/health")
    def health() -> dict[str, Any]:
        return {
            "ok": True,
            "bind_host": app.state.bind_host,
            "persist": eng.persist,
            "motto": MOTTO,
            "banner": HONEST_BANNER,
            "author": "Aziel Eliab",
        }

    @app.get("/stats")
    def stats() -> dict[str, Any]:
        return eng.stats()

    @app.get("/doctor")
    def doctor_json() -> dict[str, Any]:
        from godlock.doctor import run

        return run()

    @app.get("/verify", response_class=HTMLResponse)
    def verify(request: Request) -> HTMLResponse:
        from godlock.doctor import run

        return _dashboard(request, doctor=run())

    @app.get("/export")
    def export_json() -> Response:
        bundle = eng.export_json()
        body = json.dumps(bundle, indent=2, ensure_ascii=False) + "\n"
        return Response(
            content=body,
            media_type="application/json; charset=utf-8",
            headers={"Content-Disposition": 'attachment; filename="godlock.json"'},
        )

    @app.post("/import")
    async def import_json(request: Request) -> Any:
        ctype = (request.headers.get("content-type") or "").lower()
        wants_html = "application/json" not in ctype
        try:
            if "multipart/form-data" in ctype:
                form = await request.form()
                upload = form.get("file")
                if upload is None:
                    raise ValueError("pick a JSON file")
                raw = await upload.read() if hasattr(upload, "read") else str(upload or "")
                if isinstance(raw, bytes):
                    raw = raw.decode("utf-8")
                payload = json.loads(raw)
            else:
                payload = await request.json()
            result = eng.import_json(payload)
        except json.JSONDecodeError:
            msg = "that file is not JSON"
            if wants_html:
                return _dashboard(request, error=msg)
            return JSONResponse({"error": msg}, status_code=400)
        except (ValueError, ImmutableReceiptError, UnicodeDecodeError) as exc:
            msg = str(exc) or "could not read that file"
            if wants_html:
                return _dashboard(request, error=msg)
            return JSONResponse({"error": msg}, status_code=400)
        if wants_html:
            return _dashboard(request, import_result=result)
        return result

    @app.post("/stress")
    async def stress(request: Request) -> Any:
        ctype = request.headers.get("content-type") or ""
        if "application/json" in ctype:
            body = await request.json()
            payload = str(body.get("text") or "")
            wants_html = False
        else:
            form = await request.form()
            payload = str(form.get("text") or "")
            wants_html = True
        try:
            result = eng.submit(payload)
        except ValueError as exc:
            if wants_html:
                return _dashboard(request, error=str(exc))
            return JSONResponse({"error": str(exc)}, status_code=400)
        if wants_html:
            return _dashboard(request, result=result)
        return result

    @app.post("/merge")
    async def merge(request: Request) -> Any:
        ctype = request.headers.get("content-type") or ""
        wants_html = "application/json" not in ctype
        if "application/json" in ctype:
            body = await request.json()
            rid = str(body.get("receipt_id") or body.get("receipt") or "")
            hard = str(body.get("hardening") or "")
        else:
            form = await request.form()
            rid = str(form.get("receipt_id") or "")
            hard = str(form.get("hardening") or "")
        try:
            rule = eng.merge(rid, hard)
        except KeyError as exc:
            return JSONResponse({"error": str(exc)}, status_code=404)
        except ValueError as exc:
            return JSONResponse({"error": str(exc)}, status_code=400)
        payload = {"rule": rule.as_dict(), "rules": len(eng.rules)}
        if wants_html:
            return _dashboard(request)
        return payload

    @app.get("/capsules")
    def capsules() -> dict[str, Any]:
        # Ids + hashes only. Plaintext is not served from disk.
        return {"capsules": eng.capsule_index()}

    return app


# Convenience ASGI target is built by the CLI so the data dir is explicit.
app = None
