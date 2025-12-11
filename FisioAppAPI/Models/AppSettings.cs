namespace FisioAppAPI.Models;

public class AppSettings
{
    public string AppDomain { get; set; } = string.Empty;
    public string FrontendDomain { get; set; } = string.Empty;
    public int EmailConfirmationExpiryHours { get; set; } = 24;
    public string AdminEmail { get; set; } = string.Empty;
}

