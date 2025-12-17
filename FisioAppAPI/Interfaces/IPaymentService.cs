using FisioAppAPI.DTOs;

namespace FisioAppAPI.Interfaces;

public interface IPaymentService
{
    Task<PaymentDto?> CreatePaymentAsync(CreatePaymentDto createPaymentDto, Guid fisioterapeutaId);
    Task<List<PaymentDto>> GetPaymentsByFisioterapeutaIdAsync(Guid fisioterapeutaId);
    Task<PaymentDto?> GetPaymentByIdAsync(Guid paymentId, Guid fisioterapeutaId);
    Task<PaymentDto?> GetPaymentByAppointmentIdAsync(Guid appointmentId, Guid fisioterapeutaId);
    Task<List<PaymentDto>> GetPendingPaymentsByPacienteIdAsync(Guid pacienteId);
    Task<PaymentDto?> ConfirmPaymentAsync(Guid paymentId, Guid pacienteId, string numeroTarjeta, string titularTarjeta, string numeroAutorizacion);
}
