import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePatients, usePatient } from '@/hooks/usePatients'
import type { Patient } from '@/types/patient'

const mockPatients: Patient[] = [
  { id: '1', name: 'Ana García', room: '101' },
  { id: '2', name: 'Carlos López', room: '102' },
  { id: '3', name: 'María Rodríguez', room: '103' },
]

const createWrapper = () => {
  const queryClient = new QueryClient()
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('usePatients', () => {
  it('returns all patients when search is empty', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPatients,
    } as Response)

    const wrapper = createWrapper()
    const { result } = renderHook(() => usePatients(''), { wrapper })

    expect(result.isLoading).toBe(true)
    await waitFor(() => !result.current.isLoading)
    expect(result.current.data).toEqual(mockPatients)
    expect(result.isError).toBe(false)
  })

  it('filters patients by search term', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPatients,
    } as Response)

    const wrapper = createWrapper()
    const { result } = renderHook(() => usePatients('ana'), { wrapper })

    await waitFor(() => !result.current.isLoading)
    expect(result.current.data).toEqual([mockPatients[0]])
  })

  it('handles error when fetching patients fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)

    const wrapper = createWrapper()
    const { result } = renderHook(() => usePatients(''), { wrapper })

    await waitFor(() => result.current.isError)
    expect(result.current.isError).toBe(true)
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Error al obtener la lista de pacientes')
  })
})

describe('usePatient', () => {
  it('returns patient when id is provided', async () => {
    const mockPatient = mockPatients[0]
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPatient,
    } as Response)

    const wrapper = createWrapper()
    const { result } = renderHook(() => usePatient('1'), { wrapper })

    await waitFor(() => !result.current.isLoading)
    expect(result.current.data).toEqual(mockPatient)
    expect(result.isError).toBe(false)
  })

  it('does not fetch when id is undefined', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => usePatient(undefined), { wrapper })

    expect(fetch).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
    expect(result.isLoading).toBe(false)
  })

  it('handles error when fetching patient fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response)

    const wrapper = createWrapper()
    const { result } = renderHook(() => usePatient('999'), { wrapper })

    await waitFor(() => result.current.isError)
    expect(result.current.isError).toBe(true)
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Error al obtener el paciente')
  })
})
