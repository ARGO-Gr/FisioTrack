using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FisioAppAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddDualAppointmentStatuses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EstadoFisio",
                table: "Appointment",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "EstadoPaciente",
                table: "Appointment",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EstadoFisio",
                table: "Appointment");

            migrationBuilder.DropColumn(
                name: "EstadoPaciente",
                table: "Appointment");
        }
    }
}
