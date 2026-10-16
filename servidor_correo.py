"""
Servidor que recibe el formulario de Preanálisis y lo envía por correo
desde una única cuenta institucional (SMTP), sin depender de Google Apps Script.

Uso:
    pip install -r requirements.txt
    copiar .env.example a .env y llenar los datos
    python servidor_correo.py
Luego abrir http://localhost:5000/pages/PreAnalisi.html
"""
import os
import re
import smtplib
import ssl
from email.message import EmailMessage
from functools import lru_cache
from html import escape

import dns.exception
import dns.resolver
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.office365.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")          # cuenta institucional que envía
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
CORREO_DESTINO = os.getenv("CORREO_DESTINO", SMTP_USER)  # quién recibe las solicitudes
NOMBRE_REMITENTE = os.getenv("NOMBRE_REMITENTE", "Preanálisis de Crédito")

RAIZ = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=None)

CAMPOS = {
    "nombres": "Nombres",
    "apellidos": "Apellidos",
    "dpi": "DPI",
    "departamento": "Departamento",
    "municipio": "Municipio",
    "telefono": "Teléfono",
    "correo": "Correo electrónico",
}


@lru_cache(maxsize=512)
def dominio_recibe_correo(dominio):
    """True si el dominio puede recibir correos (tiene registro MX, o A como respaldo).
    Si el DNS no responde a tiempo se acepta, para no bloquear al usuario por una falla ajena."""
    for tipo in ("MX", "A"):
        try:
            dns.resolver.resolve(dominio, tipo, lifetime=5)
            return True
        except dns.resolver.NXDOMAIN:
            return False
        except (dns.resolver.NoAnswer, dns.resolver.NoNameservers):
            continue
        except dns.exception.DNSException:
            return True
    return False


def enviar_correo(datos):
    filas = "".join(
        f"<tr><td style='padding:6px 12px;font-weight:bold'>{etiqueta}</td>"
        f"<td style='padding:6px 12px'>{escape(datos[clave])}</td></tr>"
        for clave, etiqueta in CAMPOS.items()
    )
    texto = "\n".join(f"{etiqueta}: {datos[clave]}" for clave, etiqueta in CAMPOS.items())

    msg = EmailMessage()
    msg["Subject"] = f"Nueva solicitud de preanálisis - {datos['nombres']} {datos['apellidos']}"
    msg["From"] = f"{NOMBRE_REMITENTE} <{SMTP_USER}>"
    msg["To"] = CORREO_DESTINO
    msg.set_content(texto)
    msg.add_alternative(
        f"<h2>Nueva solicitud de preanálisis</h2><table border='1' "
        f"style='border-collapse:collapse'>{filas}</table>",
        subtype="html",
    )

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as smtp:
        smtp.starttls(context=ssl.create_default_context())
        smtp.login(SMTP_USER, SMTP_PASSWORD)
        smtp.send_message(msg)


@app.after_request
def permitir_live_server(resp):
    # Permite probar la página desde Live Server (VS Code) en localhost
    origen = request.headers.get("Origin", "")
    if re.fullmatch(r"http://(localhost|127\.0\.0\.1):\d+", origen):
        resp.headers["Access-Control-Allow-Origin"] = origen
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
        resp.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    return resp


@app.route("/api/preanalisis", methods=["OPTIONS"])
def preanalisis_preflight():
    return "", 204


@app.post("/api/preanalisis")
def preanalisis():
    datos_in = request.get_json(silent=True) or {}
    datos = {k: str(datos_in.get(k, "")).strip()[:200] for k in CAMPOS}

    if any(not v for v in datos.values()):
        return jsonify(ok=False, error="Faltan campos"), 400
    if not re.fullmatch(r"\d{13}", datos["dpi"]):
        return jsonify(ok=False, error="DPI inválido"), 400
    if not re.fullmatch(r"\d{8}", datos["telefono"]):
        return jsonify(ok=False, error="Teléfono inválido"), 400
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", datos["correo"]):
        return jsonify(ok=False, error="Correo inválido"), 400
    if not dominio_recibe_correo(datos["correo"].rsplit("@", 1)[1].lower()):
        return jsonify(ok=False, campo="correo",
                       error="El dominio del correo no existe o no recibe correos"), 400

    try:
        enviar_correo(datos)
    except Exception as e:
        app.logger.error("Error enviando correo: %s", e)
        return jsonify(ok=False, error="No se pudo enviar el correo"), 502
    return jsonify(ok=True)


# Sirve el sitio estático (index.html, pages/, css/, js/, image/ ...)
@app.get("/")
@app.get("/<path:ruta>")
def estatico(ruta="index.html"):
    if ruta.endswith(".py") or ruta.startswith(".") or "/." in ruta:
        return "No encontrado", 404
    return send_from_directory(RAIZ, ruta)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")))
