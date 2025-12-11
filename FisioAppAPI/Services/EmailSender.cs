using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using FisioAppAPI.Models;
using FisioAppAPI.Interfaces;

namespace FisioAppAPI.Services;

public class EmailSender : IEmailSender
{
    private readonly EmailSettings _settings;

    public EmailSender(IOptions<EmailSettings> options)
    {
        _settings = options.Value;
    }

    public async Task SendAsync(string toEmail, string subject, string body)
    {
        // Si SMTP no está configurado, solo imprime en consola (modo desarrollo)
        if (string.IsNullOrWhiteSpace(_settings.SmtpHost) || string.IsNullOrWhiteSpace(_settings.FromEmail))
        {
            Console.WriteLine("[EmailSender] SMTP not configured. Email would be:");
            Console.WriteLine($"To: {toEmail}");
            Console.WriteLine($"Subject: {subject}");
            Console.WriteLine(body);
            return;
        }

        try
        {
            using var message = new MailMessage();
            message.From = new MailAddress(_settings.FromEmail, _settings.FromName);
            message.To.Add(new MailAddress(toEmail));
            message.Subject = subject;
            message.Body = body;
            message.IsBodyHtml = true;

            using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
            {
                EnableSsl = _settings.UseSsl, 
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Timeout = 30000 // 30 segundos
            };

            if (!string.IsNullOrWhiteSpace(_settings.Username))
            {
                client.Credentials = new NetworkCredential(_settings.Username, _settings.Password);
            }

            Console.WriteLine($"[EmailSender] Enviando correo a {toEmail}...");
            await client.SendMailAsync(message);
            Console.WriteLine("[EmailSender] Correo enviado correctamente.");
        }
        catch (SmtpException ex)
        {
            Console.WriteLine($"[EmailSender] Error SMTP: {ex.Message}");
            // opcional: no lanzar la excepción si quieres que el registro siga funcionando
            // throw;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EmailSender] Error general al enviar correo: {ex.Message}");
            // throw;
        }
    }

}
