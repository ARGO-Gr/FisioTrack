export interface PhysiotherapistProfileDto {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseAuthority: string;
  specialties: string; // JSON: "Traumatología|Deportiva|Neurológica"
  graduationYear: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
