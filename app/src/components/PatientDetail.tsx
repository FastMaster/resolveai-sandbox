import React from 'react';
import type { Patient } from '../types/patient';

const PatientDetail: React.FC<{ patient: Patient }> = ({ patient }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-gray-500">ID</dt>
          <dd className="mt-1 text-sm text-gray-900">{patient.id}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Nombre</dt>
          <dd className="mt-1 text-sm text-gray-900">{patient.name}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Sala</dt>
          <dd className="mt-1 text-sm text-gray-900">{patient.room}</dd>
        </div>
      </dl>
    </div>
  );
};

export default PatientDetail;
