using FisioAppAPI.Data;
using FisioAppAPI.DTOs;
using FisioAppAPI.Interfaces;
using FisioAppAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FisioAppAPI.Services;

public class PatientLinkingService : IPatientLinkingService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PatientLinkingService> _logger;

    public PatientLinkingService(ApplicationDbContext context, ILogger<PatientLinkingService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<LinkedPatientDto> LinkPatientAsync(Guid fisioterapeutaId, string pacienteId)
    {
        try
        {
            // Verificar que el paciente existe
            if (!Guid.TryParse(pacienteId, out var pacienteGuid))
            {
                throw new ArgumentException("Invalid paciente ID format");
            }

            var pacienteUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == pacienteGuid);
            if (pacienteUser == null)
            {
                throw new Exception("Patient user not found");
            }

            // Verificar si ya existe un vínculo activo CON ESTE FISIO
            var existingLink = await _context.PatientLinks.FirstOrDefaultAsync(pl =>
                pl.FisioterapeutaId == fisioterapeutaId &&
                pl.PacienteId == pacienteGuid &&
                pl.IsActive);

            if (existingLink != null)
            {
                throw new Exception("This patient is already linked to this physiotherapist");
            }

            // Verificar si el paciente está VINCULADO A OTRO FISIO ACTIVO
            var linkedToOtherPhysio = await _context.PatientLinks.FirstOrDefaultAsync(pl =>
                pl.PacienteId == pacienteGuid &&
                pl.FisioterapeutaId != fisioterapeutaId &&
                pl.IsActive);

            if (linkedToOtherPhysio != null)
            {
                throw new Exception("This patient is already linked to another physiotherapist");
            }

            // Crear nuevo vínculo
            var patientLink = new PatientLink
            {
                FisioterapeutaId = fisioterapeutaId,
                PacienteId = pacienteGuid,
                FechaIngreso = DateTime.UtcNow,
                IsActive = true
            };

            _context.PatientLinks.Add(patientLink);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Patient {pacienteGuid} linked to physiotherapist {fisioterapeutaId}");

            // Retornar DTO
            return new LinkedPatientDto
            {
                Id = pacienteGuid.ToString(),
                Nombre = pacienteUser.FullName ?? "Sin nombre",
                Email = pacienteUser.Email,
                Telefono = pacienteUser.Telefono,
                FechaNacimiento = pacienteUser.FechaNacimiento,
                FechaIngreso = patientLink.FechaIngreso,
                RutinasHistorial = 0 // TODO: Contar rutinas completadas del paciente
            };
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error linking patient: {ex.Message}");
            throw;
        }
    }

    public async Task<List<LinkedPatientDto>> GetLinkedPatientsAsync(Guid fisioterapeutaId)
    {
        try
        {
            var linkedPatients = await _context.PatientLinks
                .Where(pl => pl.FisioterapeutaId == fisioterapeutaId && pl.IsActive)
                .ToListAsync();

            // Hacer join manual con Users
            var patients = new List<LinkedPatientDto>();

            foreach (var link in linkedPatients)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == link.PacienteId);
                if (user != null)
                {
                    // Contar rutinas completadas
                    var rutinasCount = await _context.Appointments
                        .Where(a => a.PacienteId == user.Id && a.FisioterapeutaId == fisioterapeutaId)
                        .CountAsync();

                    patients.Add(new LinkedPatientDto
                    {
                        Id = user.Id.ToString(),
                        Nombre = user.FullName ?? "Sin nombre",
                        Email = user.Email,
                        Telefono = user.Telefono,
                        FechaNacimiento = user.FechaNacimiento,
                        FechaIngreso = link.FechaIngreso,
                        RutinasHistorial = rutinasCount
                    });
                }
            }

            return patients;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting linked patients: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> UnlinkPatientAsync(Guid fisioterapeutaId, string pacienteId)
    {
        try
        {
            if (!Guid.TryParse(pacienteId, out var pacienteGuid))
            {
                throw new ArgumentException("Invalid paciente ID format");
            }

            var link = await _context.PatientLinks.FirstOrDefaultAsync(pl =>
                pl.FisioterapeutaId == fisioterapeutaId &&
                pl.PacienteId == pacienteGuid &&
                pl.IsActive);

            if (link == null)
            {
                return false;
            }

            // Soft delete: marcar como inactivo
            link.IsActive = false;
            link.FechaAlta = DateTime.UtcNow;
            link.UpdatedAt = DateTime.UtcNow;

            _context.PatientLinks.Update(link);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Patient {pacienteGuid} unlinked from physiotherapist {fisioterapeutaId}");

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error unlinking patient: {ex.Message}");
            throw;
        }
    }
}
