using FisioAppAPI.DTOs;
using FisioAppAPI.Interfaces;
using FisioAppAPI.Models;

namespace FisioAppAPI.Services;

public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IUserRepository _userRepository;

    public AppointmentService(IAppointmentRepository appointmentRepository, IUserRepository userRepository)
    {
        _appointmentRepository = appointmentRepository;
        _userRepository = userRepository;
    }

    public async Task<AppointmentDto?> GetAppointmentAsync(Guid id)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        if (appointment == null)
            return null;

        return await MapToDtoAsync(appointment);
    }

    public async Task<List<AppointmentDto>> GetFisioterapeutaAppointmentsAsync(Guid fisioterapeutaId, string? fecha = null)
    {
        DateOnly? parsedFecha = null;
        if (!string.IsNullOrEmpty(fecha))
        {
            if (DateOnly.TryParse(fecha, out var fechaParsed))
            {
                parsedFecha = fechaParsed;
            }
        }

        var appointments = await _appointmentRepository.GetByFisioterapeutaIdAsync(fisioterapeutaId, parsedFecha);
        var dtos = new List<AppointmentDto>();
        foreach (var appointment in appointments)
        {
            dtos.Add(await MapToDtoAsync(appointment));
        }
        return dtos;
    }

    public async Task<List<AppointmentDto>> GetFisioterapeutaAppointmentsByDateRangeAsync(Guid fisioterapeutaId, string fechaInicio, string fechaFin)
    {
        if (!DateOnly.TryParse(fechaInicio, out var parsedFechaInicio))
            throw new InvalidOperationException("Formato de fecha de inicio inválido. Use YYYY-MM-DD");

        if (!DateOnly.TryParse(fechaFin, out var parsedFechaFin))
            throw new InvalidOperationException("Formato de fecha de fin inválido. Use YYYY-MM-DD");

        var appointments = await _appointmentRepository.GetByFisioterapeutaIdAndDateRangeAsync(fisioterapeutaId, parsedFechaInicio, parsedFechaFin);
        var dtos = new List<AppointmentDto>();
        foreach (var appointment in appointments)
        {
            dtos.Add(await MapToDtoAsync(appointment));
        }
        return dtos;
    }

    public async Task<List<AppointmentDto>> GetPatientAppointmentsAsync(Guid pacienteId)
    {
        var appointments = await _appointmentRepository.GetByPacienteIdAsync(pacienteId);
        var dtos = new List<AppointmentDto>();
        foreach (var appointment in appointments)
        {
            dtos.Add(await MapToDtoAsync(appointment));
        }
        return dtos;
    }

    public async Task<AppointmentDto> CreateAppointmentAsync(CreateAppointmentDto dto)
    {
        // Validar que el paciente exista
        var paciente = await _userRepository.FindByIdAsync(dto.PacienteId);
        if (paciente == null)
            throw new InvalidOperationException("El paciente especificado no existe.");

        // Validar que el fisioterapeuta exista
        var fisioterapeuta = await _userRepository.FindByIdAsync(dto.FisioterapeutaId);
        if (fisioterapeuta == null)
            throw new InvalidOperationException("El fisioterapeuta especificado no existe.");

        // Parsear fecha y hora
        if (!DateOnly.TryParse(dto.Fecha, out var parsedFecha))
            throw new InvalidOperationException("Formato de fecha inválido. Use YYYY-MM-DD");

        if (!TimeOnly.TryParse(dto.Hora, out var parsedHora))
            throw new InvalidOperationException("Formato de hora inválido. Use HH:mm");

        // Validar que la fecha sea futura o que sea hoy pero con una hora futura
        var fechaHoraActual = DateTime.Now;
        var fechaHoraAppointment = parsedFecha.ToDateTime(parsedHora);
        
        if (fechaHoraAppointment <= fechaHoraActual)
            throw new InvalidOperationException("No se pueden crear citas en fecha/hora pasada. La cita debe ser al menos 30 minutos en el futuro.");

        // Validar conflictos de horario
        var conflictos = await _appointmentRepository.GetConflictingAppointmentsAsync(
            dto.FisioterapeutaId, parsedFecha, parsedHora);

        if (conflictos.Any())
            throw new InvalidOperationException("El fisioterapeuta ya tiene una cita en ese horario.");

        // Parsear y validar tipo
        if (!Enum.TryParse<AppointmentType>(dto.Tipo, ignoreCase: true, out var tipoAppointment))
            throw new InvalidOperationException($"Tipo de cita inválido: {dto.Tipo}");

        var appointment = new Appointment
        {
            FisioterapeutaId = dto.FisioterapeutaId,
            PacienteId = dto.PacienteId,
            Fecha = parsedFecha,
            Hora = parsedHora,
            Descripcion = dto.Descripcion,
            Tipo = tipoAppointment,
            Estado = AppointmentStatus.Pendiente
        };

        await _appointmentRepository.CreateAsync(appointment);
        return await MapToDtoAsync(appointment);
    }

    public async Task<AppointmentDto> UpdateAppointmentAsync(Guid id, UpdateAppointmentDto dto)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        if (appointment == null)
            throw new InvalidOperationException("La cita no existe.");

        // Validar que el paciente exista
        var paciente = await _userRepository.FindByIdAsync(dto.PacienteId);
        if (paciente == null)
            throw new InvalidOperationException("El paciente especificado no existe.");

        // Parsear fecha y hora
        if (!DateOnly.TryParse(dto.Fecha, out var parsedFecha))
            throw new InvalidOperationException("Formato de fecha inválido. Use YYYY-MM-DD");

        if (!TimeOnly.TryParse(dto.Hora, out var parsedHora))
            throw new InvalidOperationException("Formato de hora inválido. Use HH:mm");

        // Validar que la fecha/hora sea futura
        var fechaHoraActual = DateTime.Now;
        var fechaHoraAppointment = parsedFecha.ToDateTime(parsedHora);
        
        if (fechaHoraAppointment <= fechaHoraActual)
            throw new InvalidOperationException("No se pueden agendar citas en fecha/hora pasada. La cita debe ser al menos 30 minutos en el futuro.");

        // Validar conflictos de horario (excluyendo la cita actual)
        if (appointment.Fecha != parsedFecha || appointment.Hora != parsedHora)
        {
            var conflictos = await _appointmentRepository.GetConflictingAppointmentsAsync(
                appointment.FisioterapeutaId, parsedFecha, parsedHora, appointment.Id);

            if (conflictos.Any())
                throw new InvalidOperationException("El fisioterapeuta ya tiene una cita en ese horario.");
        }

        // Parsear y validar tipo
        if (!Enum.TryParse<AppointmentType>(dto.Tipo, ignoreCase: true, out var tipoAppointment))
            throw new InvalidOperationException($"Tipo de cita inválido: {dto.Tipo}");

        // Actualizar campos
        appointment.PacienteId = dto.PacienteId;
        appointment.Fecha = parsedFecha;
        appointment.Hora = parsedHora;
        appointment.Descripcion = dto.Descripcion;
        appointment.Tipo = tipoAppointment;

        // Validar estado
        if (!string.IsNullOrEmpty(dto.Estado))
        {
            if (Enum.TryParse<AppointmentStatus>(dto.Estado, ignoreCase: true, out var estado))
            {
                appointment.Estado = estado;
            }
            else
            {
                throw new InvalidOperationException($"Estado inválido: {dto.Estado}");
            }
        }

        await _appointmentRepository.UpdateAsync(appointment);
        return await MapToDtoAsync(appointment);
    }

    public async Task<bool> DeleteAppointmentAsync(Guid id)
    {
        return await _appointmentRepository.DeleteAsync(id);
    }

    public async Task<AppointmentDto> ChangeAppointmentStatusAsync(Guid id, string newStatus)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        if (appointment == null)
            throw new InvalidOperationException("La cita no existe.");

        // Validar que el estado sea válido
        if (!Enum.TryParse<AppointmentStatus>(newStatus, ignoreCase: true, out var parsedStatus))
            throw new InvalidOperationException($"Estado inválido: {newStatus}");

        // Actualizar el estado
        appointment.Estado = parsedStatus;
        appointment.UpdatedAt = DateTime.UtcNow;

        await _appointmentRepository.UpdateAsync(appointment);
        return await MapToDtoAsync(appointment);
    }

    public async Task<AppointmentDto> ChangeAppointmentStatusFisioAsync(Guid id, string newStatusFisio)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        if (appointment == null)
            throw new InvalidOperationException("La cita no existe.");

        // Validar que el estado sea válido
        if (!Enum.TryParse<AppointmentStatusFisio>(newStatusFisio, ignoreCase: true, out var parsedStatus))
            throw new InvalidOperationException($"Estado del fisio inválido: {newStatusFisio}");

        // Actualizar el estado del fisio
        appointment.EstadoFisio = parsedStatus;
        appointment.UpdatedAt = DateTime.UtcNow;

        await _appointmentRepository.UpdateAsync(appointment);
        return await MapToDtoAsync(appointment);
    }

    public async Task<AppointmentDto> ChangeAppointmentStatusPacienteAsync(Guid id, string newStatusPaciente)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        if (appointment == null)
            throw new InvalidOperationException("La cita no existe.");

        // Validar que el estado sea válido
        if (!Enum.TryParse<AppointmentStatusPaciente>(newStatusPaciente, ignoreCase: true, out var parsedStatus))
            throw new InvalidOperationException($"Estado del paciente inválido: {newStatusPaciente}");

        // No permitir cambios si el fisio ha cancelado la cita
        if (appointment.EstadoFisio == AppointmentStatusFisio.CanceladaFisio)
            throw new InvalidOperationException("No se puede cambiar el estado de una cita cancelada por el fisio.");

        // No permitir cambios si el fisio ha cobrado la cita
        if (appointment.EstadoFisio == AppointmentStatusFisio.Cobrado)
            throw new InvalidOperationException("No se puede cambiar el estado de una cita que ya fue cobrada.");

        // Actualizar el estado del paciente
        appointment.EstadoPaciente = parsedStatus;
        appointment.UpdatedAt = DateTime.UtcNow;

        await _appointmentRepository.UpdateAsync(appointment);
        return await MapToDtoAsync(appointment);
    }

    public async Task<List<PatientListItemDto>> GetPacientesAsync(Guid fisioterapeutaId, string? search = null)
    {
        // Si hay búsqueda, retornar solo el usuario que coincida
        if (!string.IsNullOrEmpty(search))
        {
            // Obtener todos los pacientes que tienen citas con este fisioterapeuta
            var appointments = await _appointmentRepository.GetByFisioterapeutaIdAsync(fisioterapeutaId);
            var pacienteIds = appointments.Select(a => a.PacienteId).Distinct().ToList();

            var pacientes = new List<PatientListItemDto>();
            foreach (var pacienteId in pacienteIds)
            {
                var user = await _userRepository.FindByIdAsync(pacienteId);
                if (user != null)
                {
                    var dto = new PatientListItemDto
                    {
                        Id = user.Id,
                        Nombre = user.FullName ?? "Sin nombre",
                        Email = user.Email
                    };

                    // Aplicar búsqueda - retornar solo si coincide
                    if (dto.Nombre.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                        dto.Email.Contains(search, StringComparison.OrdinalIgnoreCase))
                    {
                        pacientes.Add(dto);
                    }
                }
            }

            return pacientes;
        }

        // Si no hay búsqueda, retornar lista vacía
        return new List<PatientListItemDto>();
    }

    public async Task<List<PatientListItemDto>> SearchAllPatientsAsync(string? search = null)
    {
        if (string.IsNullOrEmpty(search))
            return new List<PatientListItemDto>();

        // Buscar usuarios por nombre o email en toda la BD
        var users = await _userRepository.SearchUsersByNameOrEmailAsync(search);

        var pacientes = users.Select(u => new PatientListItemDto
        {
            Id = u.Id,
            Nombre = u.FullName ?? "Sin nombre",
            Email = u.Email
        }).ToList();

        return pacientes;
    }

    private async Task<AppointmentDto> MapToDtoAsync(Appointment appointment)
    {
        var paciente = await _userRepository.FindByIdAsync(appointment.PacienteId);
        
        return new AppointmentDto
        {
            Id = appointment.Id,
            FisioterapeutaId = appointment.FisioterapeutaId,
            PacienteId = appointment.PacienteId,
            NombrePaciente = paciente?.FullName ?? "Sin nombre",
            EmailPaciente = paciente?.Email,
            TelefonoPaciente = paciente?.Telefono,
            Fecha = appointment.Fecha.ToString("yyyy-MM-dd"),
            Hora = appointment.Hora.ToString("HH:mm"),
            Descripcion = appointment.Descripcion,
            Tipo = appointment.Tipo.ToString(),
            EstadoFisio = appointment.EstadoFisio.ToString(),
            EstadoPaciente = appointment.EstadoPaciente.ToString(),
            Estado = appointment.Estado.ToString(),
            CreatedAt = appointment.CreatedAt,
            UpdatedAt = appointment.UpdatedAt
        };
    }
}

