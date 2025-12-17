using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FisioAppAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AppointmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FisioterapeutaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Monto = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MetodoPago = table.Column<int>(type: "int", nullable: false),
                    MontoPagado = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Cambio = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    NumeroTarjeta = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TitularTarjeta = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NumeroAutorizacion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notas = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaPago = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NombrePaciente = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailPaciente = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaCita = table.Column<DateOnly>(type: "date", nullable: false),
                    HoraCita = table.Column<TimeOnly>(type: "time", nullable: false),
                    DescripcionCita = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Payments");
        }
    }
}
