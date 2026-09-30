import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PatientList from '@/components/PatientList';
import type { Patient } from '@/types/patient';

const mockPatients: Patient[] = [
  { id: '1', name: 'Ana García', room: '101' },
  { id: '2', name: 'Carlos López', room: '102' },
  { id: '3', name: 'María Rodríguez', room: '103' },
];

describe('PatientList', () => {
  it('renders "No se encontraron pacientes" when patients array is empty', () => {
    render(<PatientList patients={[]} />);
    expect(screen.getByText('No se encontrados pacientes.')).toBeInTheDocument();
  });

  it('renders a list of patients with name, room, and ID', () => {
    render(<PatientList patients={mockPatients} />);

    expect(screen.getByText('Ana García')).toBeInTheDocument();
    expect(screen.getByText('Sala 101')).toBeInTheDocument();
    expect(screen.getByText('ID: 1')).toBeInTheDocument();

    expect(screen.getByText('Carlos López')).toBeInTheDocument();
    expect(screen.getByText('Sala 102')).toBeInTheDocument();
    expect(screen.getByText('ID: 2')).toBeInTheDocument();

    expect(screen.getByText('María Rodríguez')).toBeInTheDocument();
    expect(screen.getByText('Sala 103')).toBeInTheDocument();
    expect(screen.getByText('ID: 3')).toBeInTheDocument();
  });

  it('renders each patient in a separate list item', () => {
    render(<PatientList patients={mockPatients} />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });

  it('handles special characters in patient names', () => {
    const patientsWithSpecialChars: Patient[] = [
      { id: '4', name: 'José María O\'Connor', room: '201' },
      { id: '5', name: 'François Müller', room: '202' },
    ];

    render(<PatientList patients={patientsWithSpecialChars} />);

    expect(screen.getByText('José María O\'Connor')).toBeInTheDocument();
    expect(screen.getByText('François Müller')).toBeInTheDocument();
  });

  it('handles long patient names without breaking layout', () => {
    const longNamePatient: Patient[] = [
      { id: '6', name: 'A'.repeat(100), room: '301' },
    ];

    render(<PatientList patients={longNamePatient} />);

    expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
  });

  it('renders room number correctly for different room formats', () => {
    const patientsWithVariousRooms: Patient[] = [
      { id: '7', name: 'Paciente A', room: '101' },
      { id: '8', name: 'Paciente B', room: 'ICU-1' },
      { id: '9', name: 'Paciente C', room: 'Sala de Cirugía' },
    ];

    render(<PatientList patients={patientsWithVariousRooms} />);

    expect(screen.getByText('Sala 101')).toBeInTheDocument();
    expect(screen.getByText('Sala ICU-1')).toBeInTheDocument();
    expect(screen.getByText('Sala Sala de Cirugía')).toBeInTheDocument();
  });
});
