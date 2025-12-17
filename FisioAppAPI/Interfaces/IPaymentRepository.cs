using FisioAppAPI.DTOs;
using FisioAppAPI.Models;

namespace FisioAppAPI.Interfaces;

public interface IPaymentRepository
{
    Task<PaymentDto?> CreatePaymentAsync(CreatePaymentDto createPaymentDto, Guid fisioterapeutaId);
    Task<List<PaymentDto>> GetPaymentsByFisioterapeutaIdAsync(Guid fisioterapeutaId);
    Task<PaymentDto?> GetPaymentByIdAsync(Guid paymentId, Guid fisioterapeutaId);
    Task<PaymentDto?> GetPaymentByAppointmentIdAsync(Guid appointmentId, Guid fisioterapeutaId);
    Task<List<PaymentDto>> GetPendingPaymentsByPacienteIdAsync(Guid pacienteId);
    Task<Payment?> GetPaymentByIdForPatientAsync(Guid paymentId, Guid pacienteId);
    Task UpdatePaymentAsync(Payment payment);
}
