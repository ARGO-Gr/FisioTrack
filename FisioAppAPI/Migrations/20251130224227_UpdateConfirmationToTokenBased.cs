using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FisioAppAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateConfirmationToTokenBased : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ConfirmationCodeExpiresAt",
                table: "User",
                newName: "ConfirmationTokenExpiresAt");

            migrationBuilder.RenameColumn(
                name: "ConfirmationCode",
                table: "User",
                newName: "ConfirmationToken");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ConfirmationTokenExpiresAt",
                table: "User",
                newName: "ConfirmationCodeExpiresAt");

            migrationBuilder.RenameColumn(
                name: "ConfirmationToken",
                table: "User",
                newName: "ConfirmationCode");
        }
    }
}
