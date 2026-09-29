import { findPatient, listPatients } from "./patients.js";

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

export function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  try {
    if (req.method === "GET" && url.pathname === "/api/health")
      return send(res, 200, { ok: true });
    if (req.method === "GET" && url.pathname === "/api/patients")
      return send(res, 200, listPatients());
    const match = url.pathname.match(/^\/api\/patients\/(\d+)$/);
    if (req.method === "GET" && match) {
      const patient = findPatient(Number(match[1]));
      if (!patient) return send(res, 404, { error: "Paciente no encontrado" });
      return send(res, 200, patient);
    }
    return send(res, 404, { error: "Ruta no encontrada" });
  } catch {
    return send(res, 500, { error: "Error interno" });
  }
}
