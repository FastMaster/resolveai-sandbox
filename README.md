# ResolveAI sandbox

Minimal patients API used to validate the ResolveAI pipeline end to end
(issue → agents → QA → merge → Railway deployment → healthcheck).

- `npm start` serves on `PORT` (default 3000).
- `GET /api/health`, `GET /api/patients`, `GET /api/patients/:id`.
- CI runs the `lint`, `compile`, `unit` and `integration` checks on every PR.

Known defect kept on purpose for the test: requesting a patient that does not
exist (`GET /api/patients/999`) returns 500 instead of 404.
