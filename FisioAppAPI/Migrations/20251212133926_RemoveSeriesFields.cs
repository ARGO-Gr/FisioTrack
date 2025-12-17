using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FisioAppAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSeriesFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SeriesCompletadas",
                table: "ProgresoEjercicio");

            migrationBuilder.DropColumn(
                name: "Series",
                table: "Ejercicio");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SeriesCompletadas",
                table: "ProgresoEjercicio",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Series",
                table: "Ejercicio",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
