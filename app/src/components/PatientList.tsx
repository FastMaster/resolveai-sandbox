import React from 'react';
import type { Patient } from '../types/patient';

const PatientList: React.FC<{ patients: Patient[] }> = ({ patients }) => {
  if (patients.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        No se encontraron pacientes.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {patients.map((patient) => (
        <li key={patient.id} className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {patient.name}
            </h3>
            <span className="text-sm text-gray-600">
              Sala {patient.room}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            ID: {patient.id}
          </p>
        </li>
      ))}
    </ul>
  );
};

export default PatientList;
