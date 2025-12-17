using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FisioAppAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddProgramasRehabilitacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ejercicios_RutinasDias_RutinaDiaId",
                table: "Ejercicios");

            migrationBuilder.DropForeignKey(
                name: "FK_SemanasRutinas_ProgramasRutinas_ProgramaRutinasId",
                table: "SemanasRutinas");

            migrationBuilder.DropTable(
                name: "ProgramasRutinas");

            migrationBuilder.DropTable(
                name: "RutinasDias");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SemanasRutinas",
                table: "SemanasRutinas");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Ejercicios",
                table: "Ejercicios");

            migrationBuilder.DropIndex(
                name: "IX_Ejercicios_RutinaDiaId",
                table: "Ejercicios");

            migrationBuilder.DropColumn(
                name: "Estado",
                table: "SemanasRutinas");

            migrationBuilder.RenameTable(
                name: "SemanasRutinas",
                newName: "SemanaRutina");

            migrationBuilder.RenameTable(
                name: "Ejercicios",
                newName: "Ejercicio");

            migrationBuilder.RenameColumn(
                name: "ProgramaRutinasId",
                table: "SemanaRutina",
                newName: "ProgramaId");

            migrationBuilder.RenameIndex(
                name: "IX_SemanasRutinas_ProgramaRutinasId",
                table: "SemanaRutina",
                newName: "IX_SemanaRutina_ProgramaId");

            migrationBuilder.RenameColumn(
                name: "RutinaDiaId",
                table: "Ejercicio",
                newName: "TiempoDescanso");

            migrationBuilder.RenameColumn(
                name: "Instrucciones",
                table: "Ejercicio",
                newName: "InstruccionesJson");

            migrationBuilder.RenameColumn(
                name: "DescansoSegundos",
                table: "Ejercicio",
                newName: "DiaRutinaId");

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaCreacion",
                table: "SemanaRutina",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaCreacion",
                table: "Ejercicio",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SemanaRutina",
                table: "SemanaRutina",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Ejercicio",
                table: "Ejercicio",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "DiaRutina",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SemanaId = table.Column<int>(type: "int", nullable: false),
                    NombreDia = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    OrdenDia = table.Column<int>(type: "int", nullable: false),
                    Tipo = table.Column<int>(type: "int", nullable: false),
                    NombreRutina = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Completado = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    FechaCompletado = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiaRutina", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DiaRutina_SemanaRutina_SemanaId",
                        column: x => x.SemanaId,
                        principalTable: "SemanaRutina",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProgramaRehabilitacion",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FisioterapeutaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Diagnostico = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TotalSemanas = table.Column<int>(type: "int", nullable: false),
                    SemanaActual = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    FechaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgramaRehabilitacion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProgramaRehabilitacion_User_FisioterapeutaId",
                        column: x => x.FisioterapeutaId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProgramaRehabilitacion_User_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProgresoEjercicio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EjercicioId = table.Column<int>(type: "int", nullable: false),
                    DiaRutinaId = table.Column<int>(type: "int", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Completado = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SeriesCompletadas = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    FechaCompletado = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notas = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgresoEjercicio", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProgresoEjercicio_DiaRutina_DiaRutinaId",
                        column: x => x.DiaRutinaId,
                        principalTable: "DiaRutina",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProgresoEjercicio_Ejercicio_EjercicioId",
                        column: x => x.EjercicioId,
                        principalTable: "Ejercicio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProgresoEjercicio_User_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Ejercicio_DiaRutinaId",
                table: "Ejercicio",
                column: "DiaRutinaId");

            migrationBuilder.CreateIndex(
                name: "IX_DiaRutina_SemanaId",
                table: "DiaRutina",
                column: "SemanaId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgramaRehabilitacion_FisioterapeutaId",
                table: "ProgramaRehabilitacion",
                column: "FisioterapeutaId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgramaRehabilitacion_PacienteId",
                table: "ProgramaRehabilitacion",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgramaRehabilitacion_PacienteId_Activo",
                table: "ProgramaRehabilitacion",
                columns: new[] { "PacienteId", "Activo" });

            migrationBuilder.CreateIndex(
                name: "IX_ProgresoEjercicio_DiaRutinaId",
                table: "ProgresoEjercicio",
                column: "DiaRutinaId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgresoEjercicio_EjercicioId",
                table: "ProgresoEjercicio",
                column: "EjercicioId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgresoEjercicio_EjercicioId_PacienteId",
                table: "ProgresoEjercicio",
                columns: new[] { "EjercicioId", "PacienteId" });

            migrationBuilder.CreateIndex(
                name: "IX_ProgresoEjercicio_PacienteId",
                table: "ProgresoEjercicio",
                column: "PacienteId");

            migrationBuilder.AddForeignKey(
                name: "FK_Ejercicio_DiaRutina_DiaRutinaId",
                table: "Ejercicio",
                column: "DiaRutinaId",
                principalTable: "DiaRutina",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SemanaRutina_ProgramaRehabilitacion_ProgramaId",
                table: "SemanaRutina",
                column: "ProgramaId",
                principalTable: "ProgramaRehabilitacion",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ejercicio_DiaRutina_DiaRutinaId",
                table: "Ejercicio");

            migrationBuilder.DropForeignKey(
                name: "FK_SemanaRutina_ProgramaRehabilitacion_ProgramaId",
                table: "SemanaRutina");

            migrationBuilder.DropTable(
                name: "ProgramaRehabilitacion");

            migrationBuilder.DropTable(
                name: "ProgresoEjercicio");

            migrationBuilder.DropTable(
                name: "DiaRutina");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SemanaRutina",
                table: "SemanaRutina");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Ejercicio",
                table: "Ejercicio");

            migrationBuilder.DropIndex(
                name: "IX_Ejercicio_DiaRutinaId",
                table: "Ejercicio");

            migrationBuilder.DropColumn(
                name: "FechaCreacion",
                table: "SemanaRutina");

            migrationBuilder.RenameTable(
                name: "SemanaRutina",
                newName: "SemanasRutinas");

            migrationBuilder.RenameTable(
                name: "Ejercicio",
                newName: "Ejercicios");

            migrationBuilder.RenameColumn(
                name: "ProgramaId",
                table: "SemanasRutinas",
                newName: "ProgramaRutinasId");

            migrationBuilder.RenameIndex(
                name: "IX_SemanaRutina_ProgramaId",
                table: "SemanasRutinas",
                newName: "IX_SemanasRutinas_ProgramaRutinasId");

            migrationBuilder.RenameColumn(
                name: "TiempoDescanso",
                table: "Ejercicios",
                newName: "RutinaDiaId");

            migrationBuilder.RenameColumn(
                name: "InstruccionesJson",
                table: "Ejercicios",
                newName: "Instrucciones");

            migrationBuilder.RenameColumn(
                name: "DiaRutinaId",
                table: "Ejercicios",
                newName: "DescansoSegundos");

            migrationBuilder.AddColumn<string>(
                name: "Estado",
                table: "SemanasRutinas",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaCreacion",
                table: "Ejercicios",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SemanasRutinas",
                table: "SemanasRutinas",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Ejercicios",
                table: "Ejercicios",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "ProgramasRutinas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FisioterapeutaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    Diagnostico = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NombrePrograma = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TotalSemanas = table.Column<int>(type: "int", nullable: false)
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
                name: "RutinasDias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SemanaRutinaId = table.Column<int>(type: "int", nullable: false),
                    Completado = table.Column<bool>(type: "bit", nullable: false),
                    Dia = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FechaCompletado = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Orden = table.Column<int>(type: "int", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
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

            migrationBuilder.AddForeignKey(
                name: "FK_Ejercicios_RutinasDias_RutinaDiaId",
                table: "Ejercicios",
                column: "RutinaDiaId",
                principalTable: "RutinasDias",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SemanasRutinas_ProgramasRutinas_ProgramaRutinasId",
                table: "SemanasRutinas",
                column: "ProgramaRutinasId",
                principalTable: "ProgramasRutinas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
