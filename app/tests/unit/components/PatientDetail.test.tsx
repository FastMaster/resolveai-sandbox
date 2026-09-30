import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PatientDetail from '@/components/PatientDetail';
import type { Patient } from '@/types/patient';

const mockPatient: Patient = {
  id: '1',
  name: 'Ana García',
  room: '101',
};

describe('PatientDetail', () => {
  it('renders patient ID, name, and room', () => {
    render(<PatientDetail patient={mockPatient} />);

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Ana García')).toBeInTheDocument();
    expect(screen.getByText('Sala')).toBeInTheDocument();
    expect(screen.getByText('101')).toBeInTheDocument();
  });

  it('handles special characters in patient name', () => {
    const patientWithSpecialChars: Patient = {
      id: '2',
      name: 'José María O\'Connor',
      room: '201',
    };

    render(<PatientDetail patient={patientWithSpecialChars} />);

    expect(screen.getByText('José María O\'Connor')).toBeInTheDocument();
  });

  it('handles long patient names without breaking layout', () => {
    const longNamePatient: Patient = {
      id: '3',
      name: 'A'.repeat(100),
      room: '301',
    };

    render(<PatientDetail patient={longNamePatient} />);

    expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
  });

  it('renders room number correctly for different room formats', () => {
    const patientsWithVariousRooms = [
      { id: '4', name: 'Paciente A', room: '101' },
      { id: '5', name: 'Paciente B', room: 'ICU-1' },
      { id: '6', name: 'Paciente C', room: 'Sala de Cirugía' },
    ];

    const { rerender } = render(<PatientDetail patient={patientsWithVariousRooms[0]} />);
    expect(screen.getByText('101')).toBeInTheDocument();

    rerender(<PatientDetail patient={patientsWithVariousRooms[1]} />);
    expect(screen.getByText('ICU-1')).toBeInTheDocument();

    rerender(<PatientDetail patient={patientsWithVariousRooms[2]} />);
    expect(screen.getByText('Sala de Cirugía')).toBeInTheDocument();
  });
});
