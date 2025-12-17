using FisioAppAPI.DTOs;
using FisioAppAPI.Interfaces;
using FisioAppAPI.Models;

namespace FisioAppAPI.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IEmailSender _emailSender;

    public PaymentService(
        IPaymentRepository paymentRepository,
        IAppointmentRepository appointmentRepository,
        IEmailSender emailSender)
    {
        _paymentRepository = paymentRepository;
        _appointmentRepository = appointmentRepository;
        _emailSender = emailSender;
    }

    public async Task<PaymentDto?> CreatePaymentAsync(CreatePaymentDto createPaymentDto, Guid fisioterapeutaId)
    {
        // Crear el pago
        var payment = await _paymentRepository.CreatePaymentAsync(createPaymentDto, fisioterapeutaId);
        
        if (payment == null)
        {
            return null;
        }

        // Actualizar el estado de la cita según el método de pago
        var appointment = await _appointmentRepository.GetByIdAsync(createPaymentDto.AppointmentId);
        if (appointment != null)
        {
            // Si es pago con tarjeta, marcar como Cobro Pendiente
            // Si es efectivo, marcar como Cobrado
            if (createPaymentDto.MetodoPago == "Tarjeta")
            {
                appointment.EstadoFisio = AppointmentStatusFisio.CobroPendiente;
                
                // Enviar email al paciente notificando que tiene un pago pendiente
                if (!string.IsNullOrEmpty(payment.EmailPaciente))
                {
                    await SendPendingPaymentNotificationAsync(payment);
                }
            }
            else
            {
                appointment.EstadoFisio = AppointmentStatusFisio.Cobrado;
                
                // Enviar email de confirmación al paciente
                if (!string.IsNullOrEmpty(payment.EmailPaciente))
                {
                    await SendPaymentConfirmationEmailAsync(payment);
                }
            }
            
            appointment.UpdatedAt = DateTime.UtcNow;
            await _appointmentRepository.UpdateAsync(appointment);
        }

        return payment;
    }

    public async Task<List<PaymentDto>> GetPaymentsByFisioterapeutaIdAsync(Guid fisioterapeutaId)
    {
        return await _paymentRepository.GetPaymentsByFisioterapeutaIdAsync(fisioterapeutaId);
    }

    public async Task<PaymentDto?> GetPaymentByIdAsync(Guid paymentId, Guid fisioterapeutaId)
    {
        return await _paymentRepository.GetPaymentByIdAsync(paymentId, fisioterapeutaId);
    }

    public async Task<PaymentDto?> GetPaymentByAppointmentIdAsync(Guid appointmentId, Guid fisioterapeutaId)
    {
        return await _paymentRepository.GetPaymentByAppointmentIdAsync(appointmentId, fisioterapeutaId);
    }

    public async Task<List<PaymentDto>> GetPendingPaymentsByPacienteIdAsync(Guid pacienteId)
    {
        return await _paymentRepository.GetPendingPaymentsByPacienteIdAsync(pacienteId);
    }

    public async Task<PaymentDto?> ConfirmPaymentAsync(Guid paymentId, Guid pacienteId, string numeroTarjeta, string titularTarjeta, string numeroAutorizacion)
    {
        var payment = await _paymentRepository.GetPaymentByIdForPatientAsync(paymentId, pacienteId);
        
        if (payment == null || !payment.IsPendingPayment)
        {
            return null;
        }

        // Actualizar el pago con los datos de la tarjeta
        payment.NumeroTarjeta = numeroTarjeta;
        payment.TitularTarjeta = titularTarjeta;
        payment.NumeroAutorizacion = numeroAutorizacion;
        payment.IsPendingPayment = false;
        payment.FechaPago = DateTime.UtcNow;

        await _paymentRepository.UpdatePaymentAsync(payment);

        // Actualizar el estado de la cita a Cobrado
        var appointment = await _appointmentRepository.GetByIdAsync(payment.AppointmentId);
        if (appointment != null)
        {
            appointment.EstadoFisio = AppointmentStatusFisio.Cobrado;
            appointment.UpdatedAt = DateTime.UtcNow;
            await _appointmentRepository.UpdateAsync(appointment);
        }

        // Enviar emails de confirmación a ambas partes
        var paymentDto = MapToPaymentDto(payment);
        
        if (!string.IsNullOrEmpty(payment.EmailPaciente))
        {
            await SendPaymentConfirmationEmailAsync(paymentDto);
        }

        // Email al fisioterapeuta notificando que se completó el pago
        await SendPaymentConfirmationToPhysioAsync(paymentDto);

        return paymentDto;
    }

    private PaymentDto MapToPaymentDto(Payment payment)
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
            FechaCita = payment.FechaCita.ToString("dd/MM/yyyy"),
            HoraCita = payment.HoraCita.ToString("HH:mm"),
            DescripcionCita = payment.DescripcionCita,
            IsPendingPayment = payment.IsPendingPayment
        };
    }

    private async Task SendPaymentConfirmationToPhysioAsync(PaymentDto payment)
    {
        // Aquí deberías obtener el email del fisioterapeuta de la base de datos
        // Por ahora lo omitimos, pero puedes implementarlo si lo necesitas
        // var physio = await _userRepository.GetByIdAsync(payment.FisioterapeutaId);
        // if (physio != null && !string.IsNullOrEmpty(physio.Email))
        // {
        //     await _emailSender.SendAsync(physio.Email, "Pago Confirmado", body);
        // }
    }

    private async Task SendPaymentConfirmationEmailAsync(PaymentDto payment)
    {
        var subject = "Comprobante de Pago - FisioTrack";
        
        var metodoPagoTexto = payment.MetodoPago == "Efectivo" 
            ? $"Efectivo<br>Monto pagado: ${payment.MontoPagado:N2}<br>Cambio: ${payment.Cambio:N2}"
            : $"Tarjeta<br>Últimos 4 dígitos: {payment.NumeroTarjeta}<br>Titular: {payment.TitularTarjeta}<br>Autorización: {payment.NumeroAutorizacion}";

        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }}
        .content {{
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }}
        .info-row {{
            margin: 15px 0;
            padding: 10px;
            background-color: white;
            border-radius: 5px;
        }}
        .label {{
            font-weight: bold;
            color: #4F46E5;
        }}
        .footer {{
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>FisioTrack</h1>
            <h2>Comprobante de Pago</h2>
        </div>
        <div class='content'>
            <p>Hola <strong>{payment.NombrePaciente}</strong>,</p>
            
            <p>Hemos recibido tu pago exitosamente. A continuación los detalles:</p>
            
            <div class='info-row'>
                <span class='label'>Fecha de Cita:</span> {payment.FechaCita}
            </div>
            
            <div class='info-row'>
                <span class='label'>Hora:</span> {payment.HoraCita}
            </div>
            
            <div class='info-row'>
                <span class='label'>Descripción:</span> {payment.DescripcionCita ?? "Sin descripción"}
            </div>
            
            <div class='info-row'>
                <span class='label'>Monto:</span> ${payment.Monto:N2}
            </div>
            
            <div class='info-row'>
                <span class='label'>Método de Pago:</span><br>
                {metodoPagoTexto}
            </div>
            
            <div class='info-row'>
                <span class='label'>Fecha de Pago:</span> {payment.FechaPago:dd/MM/yyyy HH:mm}
            </div>
            
            {(!string.IsNullOrEmpty(payment.Notas) ? $@"
            <div class='info-row'>
                <span class='label'>Notas:</span> {payment.Notas}
            </div>" : "")}
            
            <div class='footer'>
                <p>Gracias por tu confianza</p>
                <p><strong>FisioTrack - Sistema de Gestión Fisioterapéutica</strong></p>
            </div>
        </div>
    </div>
</body>
</html>";

        try
        {
            await _emailSender.SendAsync(payment.EmailPaciente!, subject, body);
        }
        catch (Exception ex)
        {
            // Log el error pero no fallar la creación del pago
            Console.WriteLine($"Error sending payment confirmation email: {ex.Message}");
        }
    }

    private async Task SendPendingPaymentNotificationAsync(PaymentDto payment)
    {
        var subject = "Pago Pendiente - FisioTrack";

        var notasHtml = !string.IsNullOrEmpty(payment.Notas) 
            ? $@"<div class='info-row'>
                <span class='label'>Notas:</span> {payment.Notas}
            </div>" 
            : "";

        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #F59E0B;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }}
        .content {{
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }}
        .info-row {{
            margin: 15px 0;
            padding: 10px;
            background-color: white;
            border-radius: 5px;
        }}
        .label {{
            font-weight: bold;
            color: #F59E0B;
        }}
        .alert {{
            background-color: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }}
        .footer {{
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>FisioTrack</h1>
            <h2>Solicitud de Pago</h2>
        </div>
        <div class='content'>
            <p>Hola <strong>{payment.NombrePaciente}</strong>,</p>
            
            <div class='alert'>
                <strong>Tienes un pago pendiente</strong><br>
                Tu fisioterapeuta ha enviado un cobro por los servicios realizados. Por favor, ingresa a la aplicación para completar el pago.
            </div>
            
            <p><strong>Detalles del servicio:</strong></p>
            
            <div class='info-row'>
                <span class='label'>Fecha de Cita:</span> {payment.FechaCita}
            </div>
            
            <div class='info-row'>
                <span class='label'>Hora:</span> {payment.HoraCita}
            </div>
            
            <div class='info-row'>
                <span class='label'>Descripción:</span> {payment.DescripcionCita ?? "Sin descripción"}
            </div>
            
            <div class='info-row'>
                <span class='label'>Monto a Pagar:</span> <strong style='font-size: 1.2em; color: #F59E0B;'>${payment.Monto:N2}</strong>
            </div>
            
            {notasHtml}
            
            <p style='margin-top: 30px;'>
                <strong>Para completar tu pago:</strong><br>
                1. Ingresa a la aplicación FisioTrack<br>
                2. Ve a la sección de ""Pagos""<br>
                3. Selecciona el pago pendiente<br>
                4. Ingresa los datos de tu tarjeta<br>
            </p>
            
            <div class='footer'>
                <p>Gracias por tu preferencia</p>
                <p><strong>FisioTrack - Sistema de Gestión Fisioterapéutica</strong></p>
            </div>
        </div>
    </div>
</body>
</html>";

        try
        {
            await _emailSender.SendAsync(payment.EmailPaciente!, subject, body);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending pending payment notification email: {ex.Message}");
        }
    }
}
