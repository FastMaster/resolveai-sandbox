import { useQuery } from '@tanstack/react-query';
import type { Patient } from '../types/patient';

const fetchPatients = async (): Promise<Patient[]> => {
  const response = await fetch('/api/patients');
  if (!response.ok) {
    throw new Error('Error al obtener la lista de pacientes');
  }
  return response.json();
};

const fetchPatient = async (id: string): Promise<Patient> => {
  const response = await fetch(`/api/patients/${id}`);
  if (!response.ok) {
    throw new Error('Error al obtener el paciente');
  }
  return response.json();
};

export const usePatients = (search: string) => {
  return useQuery({
    queryKey: ['patients'],
    queryFn: fetchPatients,
    select: (data) =>
      data.filter((patient) =>
        patient.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
  });
};

export const usePatient = (id: string | undefined) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => fetchPatient(id as string),
    enabled: !!id,
  });
};
