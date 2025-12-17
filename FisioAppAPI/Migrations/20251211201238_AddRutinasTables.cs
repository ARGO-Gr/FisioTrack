using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FisioAppAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddRutinasTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProgramasRutinas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NombrePrograma = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Diagnostico = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TotalSemanas = table.Column<int>(type: "int", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FisioterapeutaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgramasRutinas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProgramasRutinas_User_FisioterapeutaId",
                        column: x => x.FisioterapeutaId,
                        principalTable: "User",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProgramasRutinas_User_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "User",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SemanasRutinas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NumeroSemana = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ProgramaRutinasId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SemanasRutinas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SemanasRutinas_ProgramasRutinas_ProgramaRutinasId",
                        column: x => x.ProgramaRutinasId,
                        principalTable: "ProgramasRutinas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RutinasDias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Dia = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Completado = table.Column<bool>(type: "bit", nullable: false),
                    FechaCompletado = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SemanaRutinaId = table.Column<int>(type: "int", nullable: false),
                    Orden = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RutinasDias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RutinasDias_SemanasRutinas_SemanaRutinaId",
                        column: x => x.SemanaRutinaId,
                        principalTable: "SemanasRutinas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Ejercicios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Series = table.Column<int>(type: "int", nullable: false),
                    Repeticiones = table.Column<int>(type: "int", nullable: false),
                    DescansoSegundos = table.Column<int>(type: "int", nullable: false),
                    Instrucciones = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RutinaDiaId = table.Column<int>(type: "int", nullable: false),
                    Orden = table.Column<int>(type: "int", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ejercicios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ejercicios_RutinasDias_RutinaDiaId",
                        column: x => x.RutinaDiaId,
                        principalTable: "RutinasDias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Ejercicios_RutinaDiaId",
                table: "Ejercicios",
                column: "RutinaDiaId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgramasRutinas_FisioterapeutaId",
                table: "ProgramasRutinas",
                column: "FisioterapeutaId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgramasRutinas_PacienteId",
                table: "ProgramasRutinas",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_RutinasDias_SemanaRutinaId",
                table: "RutinasDias",
                column: "SemanaRutinaId");

            migrationBuilder.CreateIndex(
                name: "IX_SemanasRutinas_ProgramaRutinasId",
                table: "SemanasRutinas",
                column: "ProgramaRutinasId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Ejercicios");

            migrationBuilder.DropTable(
                name: "RutinasDias");

            migrationBuilder.DropTable(
                name: "SemanasRutinas");

            migrationBuilder.DropTable(
                name: "ProgramasRutinas");
        }
    }
}
