import { useParams, Link } from 'react-router-dom';
import { usePatient } from '../hooks/usePatients';
import PatientDetail from '../components/PatientDetail';
import type { Patient } from '../types/patient';

function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: patient, isLoading, error } = usePatient(id);

  if (isLoading) {
    return (
      <p role="status" aria-live="polite" className="text-gray-600">
        Cargando detalles del paciente...
      </p>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-red-600">
        Error al cargar paciente: {error.message}
      </p>
    );
  }

  if (!patient) {
    return (
      <p role="status" className="text-gray-600">
        Paciente no encontrado.
      </p>
    );
  }

  return (
    <section aria-labelledby="detail-page-title">
      <h2 id="detail-page-title" className="sr-only">
        Detalles del paciente
      </h2>

      <Link
        to="/"
        className="inline-block mb-4 text-indigo-600 hover:text-indigo-800"
        aria-label="Volver a la lista de pacientes"
      >
        ← Volver a la lista
      </Link>

      <PatientDetail patient={patient} />
    </section>
  );
}

export default DetailPage;
