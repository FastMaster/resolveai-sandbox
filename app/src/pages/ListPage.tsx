import { useState } from 'react';
import { usePatients } from '../hooks/usePatients';
import PatientList from '../components/PatientList';

function ListPage() {
  const [search, setSearch] = useState('');
  const { data: patients, isLoading, error } = usePatients(search);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  return (
    <section aria-labelledby="list-page-title">
      <h2 id="list-page-title" className="sr-only">
        Lista de pacientes
      </h2>

      <div className="mb-6">
        <label htmlFor="patient-search" className="block text-sm font-medium text-gray-700 mb-1">
          Buscar pacientes por nombre
        </label>
        <input
          id="patient-search"
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Nombre del paciente"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
          aria-describedby="search-help"
        />
        <p id="search-help" className="mt-1 text-xs text-gray-500">
          Ingresa al menos 2 caracteres para buscar.
        </p>
      </div>

      {isLoading && (
        <p role="status" aria-live="polite" className="text-gray-600">
          Cargando pacientes...
        </p>
      )}
      {error && (
        <p role="alert" className="text-red-600">
          Error al cargar pacientes: {error.message}
        </p>
      )}
      {!isLoading && !error && (
        <PatientList patients={patients ?? []} />
      )}
    </section>
  );
}

export default ListPage;
