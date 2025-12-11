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
    }
}