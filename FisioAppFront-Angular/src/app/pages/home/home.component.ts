import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../components/ui/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../components/ui/card.component';
import { LabelComponent } from '../../components/ui/label.component';
import { InputComponent } from '../../components/ui/input.component';
import { MatIconModule } from '@angular/material/icon';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    LabelComponent,
    InputComponent,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  contactForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  showModal = false;
  modalMessage = '';
  private modalTimeout: any;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  openLegalModal(type: 'privacy' | 'terms' | 'legal'): void {
    const messages = {
      privacy: 'Política de Privacidad: Tu privacidad es importante para nosotros. Utilizamos tus datos solo para mejorar nuestros servicios.',
      terms: 'Términos de Servicio: Al usar FisioTrack, aceptas nuestros términos y condiciones de uso.',
      legal: 'Aviso Legal: FisioTrack es una plataforma de seguimiento fisioterapéutico registrada y protegida.'
    };

    this.modalMessage = messages[type];
    this.showModal = true;

    // Limpiar timeout anterior si existe
    if (this.modalTimeout) {
      clearTimeout(this.modalTimeout);
    }

    // Auto-cerrar modal después de 5 segundos
    this.modalTimeout = setTimeout(() => {
      this.showModal = false;
    }, 5000);
  }

  closeModal(): void {
    this.showModal = false;
    if (this.modalTimeout) {
      clearTimeout(this.modalTimeout);
    }
  }

  onSubmitContact(): void {
    if (this.contactForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.contactService.sendContactMessage(this.contactForm.value).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Mensaje enviado exitosamente!';
        this.contactForm.reset();
        this.isSubmitting = false;
        
        // Limpiar el mensaje de éxito después de 5 segundos
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'Error al enviar el mensaje. Intenta de nuevo.';
        this.isSubmitting = false;
      },
    });
  }
}
