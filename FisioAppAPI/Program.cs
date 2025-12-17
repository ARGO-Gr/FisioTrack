using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FisioAppAPI.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", builder =>
    {
        builder.WithOrigins("http://localhost:4200", "https://localhost:4200")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});

// Configure JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();

// Debug: Log JWT settings
Console.WriteLine("🔍 JWT Settings Loaded:");
Console.WriteLine($"   Issuer: {jwtSettings?.Issuer}");
Console.WriteLine($"   Audience: {jwtSettings?.Audience}");
Console.WriteLine($"   Key: {(string.IsNullOrEmpty(jwtSettings?.Key) ? "NOT SET" : "SET")}");
Console.WriteLine($"   DurationInMinutes: {jwtSettings?.DurationInMinutes}");

if (jwtSettings == null)
{
    throw new InvalidOperationException("JwtSettings is not configured in appsettings.json");
}

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.Configure<FisioAppAPI.Models.AppSettings>(builder.Configuration.GetSection("AppSettings"));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key))
    };
    
    // Agregar eventos para logging de JWT
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"❌ JWT Authentication Failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine("✅ JWT Token Validated Successfully");
            return Task.CompletedTask;
        }
    };
});

// Add controllers and register application services
builder.Services.AddControllers();
// User registration / confirmation services
builder.Services.Configure<FisioAppAPI.Models.EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

// DbContext (MSSQL) - reads connection string from appsettings:ConnectionStrings:DefaultConnection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<FisioAppAPI.Data.ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString)
);

builder.Services.AddScoped<FisioAppAPI.Interfaces.IUserRepository, FisioAppAPI.Repositories.UserRepository>();
builder.Services.AddScoped<FisioAppAPI.Interfaces.IUserService, FisioAppAPI.Services.UserService>();
builder.Services.AddScoped<FisioAppAPI.Interfaces.IEmailSender, FisioAppAPI.Services.EmailSender>();
builder.Services.AddScoped<FisioAppAPI.Services.IHtmlResponseService, FisioAppAPI.Services.HtmlResponseService>();
builder.Services.AddScoped<FisioAppAPI.Interfaces.IPhysiotherapistRepository, FisioAppAPI.Repositories.PhysiotherapistRepository>();
builder.Services.AddScoped<FisioAppAPI.Interfaces.IPhysiotherapistService, FisioAppAPI.Services.PhysiotherapistService>();
builder.Services.AddScoped<FisioAppAPI.Interfaces.IAppointmentRepository, FisioAppAPI.Repositories.AppointmentRepository>();
builder.Services.AddScoped<FisioAppAPI.Interfaces.IAppointmentService, FisioAppAPI.Services.AppointmentService>();
builder.Services.AddScoped<FisioAppAPI.Interfaces.IPatientLinkingService, FisioAppAPI.Services.PatientLinkingService>();
builder.Services.AddScoped<FisioAppAPI.Interfaces.IProgramaRepository, FisioAppAPI.Repositories.ProgramaRepository>();
builder.Services.AddScoped<FisioAppAPI.Interfaces.IProgramaService, FisioAppAPI.Services.ProgramaService>();
builder.Services.AddScoped<FisioAppAPI.Interfaces.IPaymentRepository, FisioAppAPI.Repositories.PaymentRepository>();
builder.Services.AddScoped<FisioAppAPI.Interfaces.IPaymentService, FisioAppAPI.Services.PaymentService>();
builder.Services.AddScoped<FisioAppAPI.Interfaces.IPaymentCardService, FisioAppAPI.Services.PaymentCardService>();
builder.Services.AddScoped<FisioAppAPI.Repositories.FollowupNoteRepository>();
builder.Services.AddScoped<FisioAppAPI.Interfaces.IFollowupNoteService, FisioAppAPI.Services.FollowupNoteService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// app.UseHttpsRedirection(); // Comentado para desarrollo con HTTP

app.UseCors("AllowAngularApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/", () => Results.Content(@"
<html>
<head>
    <title>FisioApp API</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        h1 {
            font-size: 3em;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        p {
            font-size: 1.2em;
            margin-bottom: 30px;
        }
        .status {
            background-color: rgba(255,255,255,0.2);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .footer {
            margin-top: 50px;
            font-size: 0.9em;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class='status'>
        <h1>FisioApp API</h1>
        <p>La API esta ejecutandose correctamente.</p>
    </div>
    <div class='footer'>
        <p>Desarrollado con ASP.NET Core por su servilleta</p>
    </div>
</body>
</html>", "text/html"));

app.Run();
