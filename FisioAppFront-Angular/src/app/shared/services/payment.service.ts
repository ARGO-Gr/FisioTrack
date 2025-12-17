import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Payment {
  id: string;
  appointmentId: string;
  fisioterapeutaId: string;
  pacienteId: string;
  monto: number;
  metodoPago: string;
  montoPagado?: number;
  cambio?: number;
  numeroTarjeta?: string;
  titularTarjeta?: string;
  numeroAutorizacion?: string;
  notas?: string;
  fechaPago: Date;
  isPendingPayment: boolean;
  nombrePaciente?: string;
  emailPaciente?: string;
  fechaCita: string;
  horaCita: string;
  descripcionCita?: string;
}

export interface CreatePaymentDto {
  appointmentId: string;
  monto: number;
  metodoPago: string;
  montoPagado?: number;
  cambio?: number;
  numeroTarjeta?: string;
  titularTarjeta?: string;
  numeroAutorizacion?: string;
  notas?: string;
}

export interface ConfirmPaymentDto {
  numeroTarjeta: string;
  titularTarjeta: string;
  numeroAutorizacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/api/payments`;

  constructor(private http: HttpClient) {}

  createPayment(payment: CreatePaymentDto): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, payment);
  }

  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl);
  }

  getPaymentById(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`);
  }

  getPaymentByAppointmentId(appointmentId: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/by-appointment/${appointmentId}`);
  }

  // Métodos para pacientes
  getPendingPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/pending`);
  }

  getAllPaymentsByPatient(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/patient/all`);
  }

  confirmPayment(paymentId: string, confirmDto: ConfirmPaymentDto): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${paymentId}/confirm`, confirmDto);
  }
}
