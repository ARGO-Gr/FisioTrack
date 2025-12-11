using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FisioAppAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUserLockingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FailedLoginAttempts",
                table: "User",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsLocked",
                table: "User",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastFailedLoginAttempt",
                table: "User",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UnlockCode",
                table: "User",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UnlockCodeExpiresAt",
                table: "User",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FailedLoginAttempts",
                table: "User");

            migrationBuilder.DropColumn(
                name: "IsLocked",
                table: "User");

            migrationBuilder.DropColumn(
                name: "LastFailedLoginAttempt",
                table: "User");

            migrationBuilder.DropColumn(
                name: "UnlockCode",
                table: "User");

            migrationBuilder.DropColumn(
                name: "UnlockCodeExpiresAt",
                table: "User");
        }
    }
}
