namespace FisioAppAPI.Models;

public class EmailSettings
{
    public string? SmtpHost { get; set; }
    public int SmtpPort { get; set; }
    public bool UseSsl { get; set; }
    public string? FromName { get; set; }
    public string? FromEmail { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
}
