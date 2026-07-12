import logging
import smtplib
import ssl
import time
from email.message import EmailMessage
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)

NOTIF_DIR = Path(__file__).resolve().parents[2] / "notifications"
NOTIF_DIR.mkdir(exist_ok=True)
LOG_FILE = NOTIF_DIR / "log.jsonl"


def render_alert_html(alerts: list[dict], meta: dict | None = None) -> str:
    meta = meta or {}
    rows = "".join(
        "<tr>"
        f"<td style='padding:8px 10px;border-bottom:1px solid #eee'>{a.get('title','')}<br>"
        f"<span style='color:#5b6786;font-size:12px'>{a.get('description','')}</span></td>"
        f"<td style='padding:8px 10px;border-bottom:1px solid #eee;text-transform:capitalize'>{a.get('type','')}</td>"
        f"<td style='padding:8px 10px;border-bottom:1px solid #eee;text-transform:capitalize'>{a.get('severity','')}</td>"
        f"<td style='padding:8px 10px;border-bottom:1px solid #eee'>{a.get('impact') if a.get('impact') is not None else '-'}</td>"
        "</tr>"
        for a in alerts
    )
    return f"""
    <html><body style="font-family:Inter,Segoe UI,Arial;color:#0c1330">
      <div style="max-width:680px;margin:auto;padding:24px">
        <h2 style="color:#2f6bff">BIAT Assurance · Alertes intelligentes</h2>
        <p>{meta.get('intro','Voici le récapitulatif des alertes détectées par le moteur BIAT.')}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead><tr style="text-align:left;color:#5b6786">
            <th style="padding:8px 10px">Alerte</th><th>Type</th><th>Criticité</th><th>Impact</th>
          </tr></thead>
          <tbody>{rows}</tbody>
        </table>
        <p style="color:#5b6786;font-size:12px;margin-top:18px">
          Généré automatiquement par Insurance AI Copilot · {meta.get('generated_at','')}
        </p>
      </div>
    </body></html>
    """


def _record(status: str, to: str, reason: str, count: int) -> dict:
    entry = {
        "ts": time.time(),
        "status": status,
        "to": to,
        "reason": reason,
        "alerts": count,
    }
    try:
        with LOG_FILE.open("a", encoding="utf-8") as f:
            f.write(__import__("json").dumps(entry) + "\n")
    except Exception:
        logger.exception("failed to write notification log")
    return entry


def send_email(subject: str, html: str, to: str | None = None) -> dict:
    to = (to or settings.alert_to_email).strip()
    if not to:
        return _record("skipped", to or "", "no recipient configured", 0)

    if not settings.smtp_host:
        path = NOTIF_DIR / f"alert_{int(time.time())}.html"
        try:
            path.write_text(html, encoding="utf-8")
        except Exception:
            logger.exception("failed to save mock email")
        return _record("mock", to, f"saved to {path.name} (SMTP not configured)", 0)

    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = settings.alert_from_email
        msg["To"] = to
        msg.set_content("Version texte indisponible — voir la version HTML.")
        msg.add_alternative(html, subtype="html")

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
            if settings.smtp_tls:
                server.starttls(context=ssl.create_default_context())
            if settings.smtp_user:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        return _record("sent", to, "delivered via SMTP", 0)
    except Exception as e:
        logger.exception("SMTP send failed")
        return _record("error", to, f"SMTP error: {e}", 0)


def send_alert_digest(alerts: list[dict], to: str | None = None) -> dict:
    if not alerts:
        return _record("skipped", to or settings.alert_to_email or "", "no alerts to send", 0)
    html = render_alert_html(alerts, {"generated_at": time.strftime("%Y-%m-%d %H:%M")})
    result = send_email("BIAT Assurance — Alertes intelligentes", html, to)
    # update alert count on the recorded entry
    try:
        lines = LOG_FILE.read_text(encoding="utf-8").splitlines()
        if lines:
            last = __import__("json").loads(lines[-1])
            last["alerts"] = len(alerts)
            lines[-1] = __import__("json").dumps(last)
            LOG_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")
    except Exception:
        pass
    return {**result, "alerts": len(alerts)}


def list_notifications(limit: int = 20) -> list[dict]:
    if not LOG_FILE.exists():
        return []
    out = []
    for line in LOG_FILE.read_text(encoding="utf-8").splitlines()[-limit:]:
        line = line.strip()
        if not line:
            continue
        try:
            out.append(__import__("json").loads(line))
        except Exception:
            continue
    return list(reversed(out))
