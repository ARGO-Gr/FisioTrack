import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../../components/ui/index';
import { InMemoryDatabaseService } from '../../../../shared/in-memory-db/in-memory.service';
import { Rutina } from '../../../../shared/models';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, MatIconModule],
  template: `
    <div class="min-h-screen bg-background">
      <header class="border-b border-border bg-card sticky top-0 z-50">
        <div class="container mx-auto px-4 py-4 flex items-center gap-4">
          <a routerLink="/paciente/rutinas" class="text-primary hover:text-primary/80">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <h1 class="text-2xl font-bold">Detalle de Rutina</h1>
        </div>
      </header>
      <main class="container mx-auto px-4 py-8">
        <app-card *ngIf="rutina">
          <app-card-header>
            <app-card-title class="text-3xl">{{ rutina.nombre }}</app-card-title>
          </app-card-header>
          <app-card-content>
            <p class="text-muted-foreground mb-6">{{ rutina.descripcion }}</p>
            
            <h3 class="font-semibold text-lg mb-4">Ejercicios ({{ rutina.ejercicios.length }})</h3>
            <div class="space-y-4">
              <div *ngFor="let ejercicio of rutina.ejercicios" class="p-4 border rounded-lg">
                <h4 class="font-medium">{{ ejercicio.nombre }}</h4>
                <p class="text-sm text-muted-foreground">{{ ejercicio.descripcion }}</p>
                <div class="mt-2 text-sm">
                  <p><strong>Series:</strong> {{ ejercicio.series }}</p>
                  <p><strong>Repeticiones:</strong> {{ ejercicio.repeticiones }}</p>
                  <p *ngIf="ejercicio.duracion"><strong>Duración:</strong> {{ ejercicio.duracion }}s</p>
                </div>
              </div>
            </div>
          </app-card-content>
        </app-card>
      </main>
    </div>
  `,
})
export class DetalleRutinaComponent implements OnInit {
  rutina: Rutina | null = null;

  constructor(private route: ActivatedRoute, private db: InMemoryDatabaseService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.db.getRutinaById(id).subscribe((r: Rutina | undefined) => (this.rutina = r || null));
    }
  }
}
