const patients = [
  { id: 1, name: "Ana García", ward: "Cardiología" },
  { id: 2, name: "Luis Pérez", ward: "Traumatología" },
  { id: 3, name: "Marta Ruiz", ward: "Pediatría" },
];

export function listPatients() {
  return patients.map(({ id, name }) => ({ id, name }));
}

export function findPatient(id) {
  const patient = patients.find((p) => p.id === id);
  if (!patient) return null;
  return { id: patient.id, name: patient.name, ward: patient.ward };
}
