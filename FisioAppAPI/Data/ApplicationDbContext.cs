using Microsoft.EntityFrameworkCore;
using FisioAppAPI.Models;

namespace FisioAppAPI.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<PhysiotherapistProfile> PhysiotherapistProfiles { get; set; } = null!;
    public DbSet<Appointment> Appointments { get; set; } = null!;
    public DbSet<PatientLink> PatientLinks { get; set; } = null!;
    public DbSet<Payment> Payments { get; set; } = null!;
    public DbSet<PaymentCard> PaymentCards { get; set; } = null!;
    public DbSet<ProgramaRehabilitacion> ProgramasRehabilitacion { get; set; } = null!;
    public DbSet<SemanaRutina> SemanasRutina { get; set; } = null!;
    public DbSet<DiaRutina> DiasRutina { get; set; } = null!;
    public DbSet<Ejercicio> Ejercicios { get; set; } = null!;
    public DbSet<ProgresoEjercicio> ProgresoEjercicios { get; set; } = null!;
    public DbSet<FollowupNote> FollowupNotes { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("User");
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email)
                  .IsRequired()
                  .HasMaxLength(255);
            entity.Property(u => u.PasswordHash)
                  .IsRequired()
                  .HasMaxLength(255);
            entity.Property(u => u.CreatedAt)
                  .HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<PhysiotherapistProfile>(entity =>
        {
            entity.ToTable("PhysiotherapistProfile");
            entity.HasKey(p => p.Id);

            entity.HasOne<User>()
                  .WithOne()
                  .HasForeignKey<PhysiotherapistProfile>(p => p.UserId)
                  .IsRequired()
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(p => p.LicenseNumber).IsUnique();
            entity.Property(p => p.LicenseNumber)
                  .IsRequired()
                  .HasMaxLength(100);
            entity.Property(p => p.LicenseAuthority)
                  .IsRequired()
                  .HasMaxLength(255);
            entity.Property(p => p.Specialties)
                  .IsRequired();
            entity.Property(p => p.CreatedAt)
                  .HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.ToTable("Appointment");
            entity.HasKey(a => a.Id);
            entity.Property(a => a.FisioterapeutaId).IsRequired();
            entity.Property(a => a.PacienteId).IsRequired();
            entity.Property(a => a.Fecha).IsRequired();
            entity.Property(a => a.Hora).IsRequired();
            entity.Property(a => a.Descripcion)
                  .IsRequired(false)
                  .HasMaxLength(1000);
            entity.Property(a => a.Tipo)
                  .IsRequired()
                  .HasDefaultValue(AppointmentType.Seguimiento);
            entity.Property(a => a.Estado)
                  .IsRequired()
                  .HasDefaultValue(AppointmentStatus.Pendiente);
            entity.Property(a => a.CreatedAt)
                  .HasDefaultValueSql("GETUTCDATE()");
            
            // Índices para búsquedas comunes
            entity.HasIndex(a => a.FisioterapeutaId);
            entity.HasIndex(a => a.PacienteId);
            entity.HasIndex(a => new { a.FisioterapeutaId, a.Fecha });
        });

        modelBuilder.Entity<PatientLink>(entity =>
        {
            entity.ToTable("PatientLink");
            entity.HasKey(pl => pl.Id);
            entity.Property(pl => pl.FisioterapeutaId).IsRequired();
            entity.Property(pl => pl.PacienteId).IsRequired();
            entity.Property(pl => pl.FechaIngreso)
                  .IsRequired()
                  .HasDefaultValueSql("GETUTCDATE()");
            entity.Property(pl => pl.IsActive)
                  .IsRequired()
                  .HasDefaultValue(true);
            entity.Property(pl => pl.CreatedAt)
                  .HasDefaultValueSql("GETUTCDATE()");
            
            // Índices para búsquedas comunes
            entity.HasIndex(pl => pl.FisioterapeutaId);
            entity.HasIndex(pl => pl.PacienteId);
            entity.HasIndex(pl => new { pl.FisioterapeutaId, pl.IsActive });
            
            // Constraint único: un fisioterapeuta no puede vincular el mismo paciente dos veces (activo)
            entity.HasIndex(pl => new { pl.FisioterapeutaId, pl.PacienteId })
                  .IsUnique(false); // Permite múltiples, pero historiales
        });

        modelBuilder.Entity<ProgramaRehabilitacion>(entity =>
        {
            entity.ToTable("ProgramaRehabilitacion");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.PacienteId).IsRequired();
            entity.Property(p => p.FisioterapeutaId).IsRequired();
            entity.Property(p => p.Nombre).IsRequired().HasMaxLength(200);
            entity.Property(p => p.Descripcion).HasMaxLength(1000);
            entity.Property(p => p.Diagnostico).IsRequired().HasMaxLength(500);
            entity.Property(p => p.FechaInicio).IsRequired();
            entity.Property(p => p.FechaFin).IsRequired();
            entity.Property(p => p.TotalSemanas).IsRequired();
            entity.Property(p => p.SemanaActual).IsRequired().HasDefaultValue(1);
            entity.Property(p => p.Activo).IsRequired().HasDefaultValue(true);
            entity.Property(p => p.FechaCreacion).HasDefaultValueSql("GETUTCDATE()");

            // Configurar relaciones explícitamente para evitar ciclos de cascada
            entity.HasOne(p => p.Paciente)
                  .WithMany()
                  .HasForeignKey(p => p.PacienteId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.Fisioterapeuta)
                  .WithMany()
                  .HasForeignKey(p => p.FisioterapeutaId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(p => p.PacienteId);
            entity.HasIndex(p => p.FisioterapeutaId);
            entity.HasIndex(p => new { p.PacienteId, p.Activo });
        });

        modelBuilder.Entity<SemanaRutina>(entity =>
        {
            entity.ToTable("SemanaRutina");
            entity.HasKey(s => s.Id);
            entity.Property(s => s.ProgramaId).IsRequired();
            entity.Property(s => s.NumeroSemana).IsRequired();
            entity.Property(s => s.FechaCreacion).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(s => s.Programa)
                  .WithMany(p => p.Semanas)
                  .HasForeignKey(s => s.ProgramaId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(s => s.ProgramaId);
        });

        modelBuilder.Entity<DiaRutina>(entity =>
        {
            entity.ToTable("DiaRutina");
            entity.HasKey(d => d.Id);
            entity.Property(d => d.SemanaId).IsRequired();
            entity.Property(d => d.NombreDia).IsRequired().HasMaxLength(20);
            entity.Property(d => d.OrdenDia).IsRequired();
            entity.Property(d => d.Tipo).IsRequired();
            entity.Property(d => d.NombreRutina).HasMaxLength(200);
            entity.Property(d => d.Completado).IsRequired().HasDefaultValue(false);
            entity.Property(d => d.FechaCreacion).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(d => d.Semana)
                  .WithMany(s => s.Dias)
                  .HasForeignKey(d => d.SemanaId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(d => d.SemanaId);
        });

        modelBuilder.Entity<Ejercicio>(entity =>
        {
            entity.ToTable("Ejercicio");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DiaRutinaId).IsRequired();
            entity.Property(e => e.Orden).IsRequired();
            entity.Property(e => e.Nombre).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Descripcion).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Repeticiones).IsRequired();
            entity.Property(e => e.TiempoDescanso).IsRequired();
            entity.Property(e => e.InstruccionesJson).IsRequired();
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(e => e.DiaRutina)
                  .WithMany(d => d.Ejercicios)
                  .HasForeignKey(e => e.DiaRutinaId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.DiaRutinaId);
        });

        modelBuilder.Entity<ProgresoEjercicio>(entity =>
        {
            entity.ToTable("ProgresoEjercicio");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.EjercicioId).IsRequired();
            entity.Property(p => p.DiaRutinaId).IsRequired();
            entity.Property(p => p.PacienteId).IsRequired();
            entity.Property(p => p.Completado).IsRequired().HasDefaultValue(false);
            entity.Property(p => p.Notas).HasMaxLength(1000);
            entity.Property(p => p.FechaCreacion).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(p => p.Ejercicio)
                  .WithMany(e => e.Progresos)
                  .HasForeignKey(p => p.EjercicioId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(p => p.DiaRutina)
                  .WithMany(d => d.Progresos)
                  .HasForeignKey(p => p.DiaRutinaId)
                  .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(p => p.EjercicioId);
            entity.HasIndex(p => p.DiaRutinaId);
            entity.HasIndex(p => p.PacienteId);
            entity.HasIndex(p => new { p.EjercicioId, p.PacienteId });
        });

        modelBuilder.Entity<PaymentCard>(entity =>
        {
            entity.ToTable("PaymentCard");
            entity.HasKey(pc => pc.Id);
            entity.Property(pc => pc.PacienteId).IsRequired();
            entity.Property(pc => pc.CardNumberEncrypted)
                  .IsRequired()
                  .HasMaxLength(500); // Encrypted card number
            entity.Property(pc => pc.Last4)
                  .IsRequired()
                  .HasMaxLength(4);
            entity.Property(pc => pc.CardHolderName)
                  .IsRequired()
                  .HasMaxLength(255);
            entity.Property(pc => pc.ExpiryMonth).IsRequired();
            entity.Property(pc => pc.ExpiryYear).IsRequired();
            entity.Property(pc => pc.CardType).IsRequired();
            entity.Property(pc => pc.IsDefault).IsRequired().HasDefaultValue(false);
            entity.Property(pc => pc.IsActive).IsRequired().HasDefaultValue(true);
            entity.Property(pc => pc.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasIndex(pc => pc.PacienteId);
            entity.HasIndex(pc => new { pc.PacienteId, pc.IsDefault });
        });

        modelBuilder.Entity<FollowupNote>(entity =>
        {
            entity.ToTable("FollowupNote");
            entity.HasKey(fn => fn.Id);
            entity.Property(fn => fn.AppointmentId).IsRequired();
            entity.Property(fn => fn.Contenido)
                  .IsRequired()
                  .HasMaxLength(2000);
            entity.Property(fn => fn.CreatedAt)
                  .IsRequired()
                  .HasDefaultValueSql("GETUTCDATE()");
            entity.Property(fn => fn.UpdatedAt)
                  .IsRequired()
                  .HasDefaultValueSql("GETUTCDATE()");

            entity.HasIndex(fn => fn.AppointmentId).IsUnique();
        });
    }

}