import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfileDto {
  id: string;
  email: string;
  fullName?: string;
  telefono?: string;
  fechaNacimiento?: string;
}

export interface UpdateUserProfileDto {
  fullName?: string;
  telefono?: string;
  fechaNacimiento?: string;
}

export interface PaymentCardDto {
  id: string;
  last4: string;
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
  cardType: string;
  isDefault: boolean;
}

export interface CreatePaymentCardDto {
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface UpdatePaymentCardDto {
  id: string;
  isDefault: boolean;
}

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

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  // User Profile
  getUserProfile(): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.apiUrl}/profile`);
  }

  updateUserProfile(dto: UpdateUserProfileDto): Observable<UserProfileDto> {
    return this.http.put<UserProfileDto>(`${this.apiUrl}/profile`, dto);
  }

  // Payment Cards
  getPaymentCards(): Observable<PaymentCardDto[]> {
    return this.http.get<PaymentCardDto[]>(`${this.apiUrl}/payment-cards`);
  }

  addPaymentCard(dto: CreatePaymentCardDto): Observable<PaymentCardDto> {
    return this.http.post<PaymentCardDto>(`${this.apiUrl}/payment-cards`, dto);
  }

  setDefaultPaymentCard(cardId: string): Observable<PaymentCardDto> {
    return this.http.put<PaymentCardDto>(
      `${this.apiUrl}/payment-cards/${cardId}/set-default`,
      {}
    );
  }

  deletePaymentCard(cardId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/payment-cards/${cardId}`);
  }

  // Physiotherapist Profile
  getPhysiotherapistProfile(): Observable<PhysiotherapistProfileDto> {
    return this.http.get<PhysiotherapistProfileDto>(`${this.apiUrl}/physiotherapist-profile`);
  }
}
