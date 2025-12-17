using FisioAppAPI.Data;
using FisioAppAPI.DTOs;
using FisioAppAPI.Interfaces;
using FisioAppAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FisioAppAPI.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly ApplicationDbContext _context;

    public PaymentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaymentDto?> CreatePaymentAsync(CreatePaymentDto createPaymentDto, Guid fisioterapeutaId)
    {
        // Verificar que la cita existe y pertenece al fisioterapeuta
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == createPaymentDto.AppointmentId && a.FisioterapeutaId == fisioterapeutaId);

        if (appointment == null)
        {
            return null;
        }

        // Obtener información del paciente
        var paciente = await _context.Users.FirstOrDefaultAsync(u => u.Id == appointment.PacienteId);
        if (paciente == null)
        {
            return null;
        }

        // Determinar el método de pago
        var metodoPago = createPaymentDto.MetodoPago.ToLower() == "efectivo" 
            ? PaymentMethod.Efectivo 
            : PaymentMethod.Tarjeta;

        // Si es pago con tarjeta, marcar como pendiente
        var isPending = metodoPago == PaymentMethod.Tarjeta;

        var payment = new Payment
        {
            AppointmentId = createPaymentDto.AppointmentId,
            FisioterapeutaId = fisioterapeutaId,
            PacienteId = appointment.PacienteId,
            Monto = createPaymentDto.Monto,
            MetodoPago = metodoPago,
            MontoPagado = createPaymentDto.MontoPagado,
            Cambio = createPaymentDto.Cambio,
            NumeroTarjeta = createPaymentDto.NumeroTarjeta,
            TitularTarjeta = createPaymentDto.TitularTarjeta,
            NumeroAutorizacion = createPaymentDto.NumeroAutorizacion,
            Notas = createPaymentDto.Notas,
            IsPendingPayment = isPending,
            NombrePaciente = paciente.FullName ?? paciente.Email,
            EmailPaciente = paciente.Email,
            FechaCita = appointment.Fecha,
            HoraCita = appointment.Hora,
            DescripcionCita = appointment.Descripcion
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        return MapToDto(payment);
    }

    public async Task<List<PaymentDto>> GetPaymentsByFisioterapeutaIdAsync(Guid fisioterapeutaId)
    {
        var payments = await _context.Payments
            .Where(p => p.FisioterapeutaId == fisioterapeutaId)
            .OrderByDescending(p => p.FechaPago)
            .ToListAsync();

        return payments.Select(MapToDto).ToList();
    }

    public async Task<PaymentDto?> GetPaymentByIdAsync(Guid paymentId, Guid fisioterapeutaId)
    {
        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.Id == paymentId && p.FisioterapeutaId == fisioterapeutaId);

        return payment != null ? MapToDto(payment) : null;
    }

    public async Task<PaymentDto?> GetPaymentByAppointmentIdAsync(Guid appointmentId, Guid fisioterapeutaId)
    {
        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.AppointmentId == appointmentId && p.FisioterapeutaId == fisioterapeutaId);

        return payment != null ? MapToDto(payment) : null;
    }

    public async Task<List<PaymentDto>> GetPendingPaymentsByPacienteIdAsync(Guid pacienteId)
    {
        var payments = await _context.Payments
            .Where(p => p.PacienteId == pacienteId && p.IsPendingPayment)
            .OrderByDescending(p => p.FechaPago)
            .ToListAsync();

        return payments.Select(MapToDto).ToList();
    }

    public async Task<Payment?> GetPaymentByIdForPatientAsync(Guid paymentId, Guid pacienteId)
    {
        return await _context.Payments
            .FirstOrDefaultAsync(p => p.Id == paymentId && p.PacienteId == pacienteId);
    }

    public async Task UpdatePaymentAsync(Payment payment)
    {
        _context.Payments.Update(payment);
        await _context.SaveChangesAsync();
    }

    private PaymentDto MapToDto(Payment payment)
    {
        return new PaymentDto
        {
            Id = payment.Id,
            AppointmentId = payment.AppointmentId,
            FisioterapeutaId = payment.FisioterapeutaId,
            PacienteId = payment.PacienteId,
            Monto = payment.Monto,
            MetodoPago = payment.MetodoPago.ToString(),
            MontoPagado = payment.MontoPagado,
            Cambio = payment.Cambio,
            NumeroTarjeta = payment.NumeroTarjeta,
            TitularTarjeta = payment.TitularTarjeta,
            NumeroAutorizacion = payment.NumeroAutorizacion,
            Notas = payment.Notas,
            FechaPago = payment.FechaPago,
            NombrePaciente = payment.NombrePaciente,
            EmailPaciente = payment.EmailPaciente,
            FechaCita = payment.FechaCita.ToString("yyyy-MM-dd"),
            HoraCita = payment.HoraCita.ToString("HH:mm"),
            DescripcionCita = payment.DescripcionCita,
            IsPendingPayment = payment.IsPendingPayment
        };
    }
}
