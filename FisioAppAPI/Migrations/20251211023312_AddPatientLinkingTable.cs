using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FisioAppAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddPatientLinkingTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PatientLink",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FisioterapeutaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Diagnostico = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    FechaIngreso = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    FechaAlta = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientLink", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PatientLink_FisioterapeutaId",
                table: "PatientLink",
                column: "FisioterapeutaId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientLink_FisioterapeutaId_IsActive",
                table: "PatientLink",
                columns: new[] { "FisioterapeutaId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_PatientLink_FisioterapeutaId_PacienteId",
                table: "PatientLink",
                columns: new[] { "FisioterapeutaId", "PacienteId" });

            migrationBuilder.CreateIndex(
                name: "IX_PatientLink_PacienteId",
                table: "PatientLink",
                column: "PacienteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PatientLink");
        }
    }
}
