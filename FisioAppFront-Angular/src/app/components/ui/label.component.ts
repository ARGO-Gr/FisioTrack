import { Component, Input } from '@angular/core';
import { cn } from '../../../lib/utils';

@Component({
  selector: 'app-label',
  standalone: true,
  imports: [],
  template: `
    <label [class]="labelClass" [for]="htmlFor">
      <ng-content></ng-content>
    </label>
  `,
  styles: []
})
export class LabelComponent {
  @Input() htmlFor = '';
  @Input() className = '';

  get labelClass() {
    return cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      this.className
    );
  }
}
