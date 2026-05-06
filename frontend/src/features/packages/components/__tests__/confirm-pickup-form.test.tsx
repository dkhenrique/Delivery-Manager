import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ConfirmPickupForm } from '../confirm-pickup-form'
import React, { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

// Mock react's useActionState
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useActionState: vi.fn(),
  }
})

// Mock react-dom's useFormStatus
vi.mock('react-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dom')>()
  return {
    ...actual,
    useFormStatus: vi.fn(),
  }
})

describe('ConfirmPickupForm', () => {
  const mockUseActionState = useActionState as any
  const mockUseFormStatus = useFormStatus as any

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseActionState.mockReturnValue([{ success: false }, vi.fn(), false])
    mockUseFormStatus.mockReturnValue({ pending: false })
  })

  it('renders the initial form correctly', () => {
    render(<ConfirmPickupForm packageId="pkg-123" />)
    
    expect(screen.getByLabelText(/Código de Segurança/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ex: 123456')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Confirmar Retirada/i })).toBeInTheDocument()
  })

  it('restricts input to numbers only and max 6 characters', async () => {
    const user = userEvent.setup()
    render(<ConfirmPickupForm packageId="pkg-123" />)
    
    const input = screen.getByLabelText(/Código de Segurança/i) as HTMLInputElement
    
    await user.type(input, '12A34B5678')
    
    // As 'A', 'B' shouldn't be typed and max length is 6, it should be '123456'
    expect(input.value).toBe('123456')
  })

  it('applies green border classes when exactly 6 digits are typed', async () => {
    const user = userEvent.setup()
    render(<ConfirmPickupForm packageId="pkg-123" />)
    
    const input = screen.getByLabelText(/Código de Segurança/i)
    
    // Type 5 digits -> no green border
    await user.type(input, '12345')
    expect(input.className).not.toContain('border-green-500')
    
    // Type 6th digit -> green border should be applied
    await user.type(input, '6')
    expect(input.className).toContain('border-green-500')
  })

  it('displays the success state when action is successful', () => {
    mockUseActionState.mockReturnValue([{ success: true, message: 'Sucesso absoluto' }, vi.fn(), false])
    
    render(<ConfirmPickupForm packageId="pkg-123" />)
    
    expect(screen.getByText('Retirada Confirmada!')).toBeInTheDocument()
    expect(screen.getByText('Sucesso absoluto')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Voltar para a Lista/i })).toBeInTheDocument()
    
    // The form input should not be visible anymore
    expect(screen.queryByLabelText(/Código de Segurança/i)).not.toBeInTheDocument()
  })

  it('displays the error message if action failed with a message', () => {
    mockUseActionState.mockReturnValue([{ success: false, message: 'Código inválido' }, vi.fn(), false])
    
    render(<ConfirmPickupForm packageId="pkg-123" />)
    
    expect(screen.getByText('Código inválido')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveClass('bg-red-100')
  })

  it('shows pending state on the button when form is submitting', () => {
    mockUseFormStatus.mockReturnValue({ pending: true })
    
    render(<ConfirmPickupForm packageId="pkg-123" />)
    
    const button = screen.getByRole('button', { name: /Validando Código.../i })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })
})
