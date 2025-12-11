import { Component, Input } from '@angular/core';
import { cn } from '../../../lib/utils';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  template: `<div [class]="cardClass"><ng-content></ng-content></div>`,
  styles: []
})
export class CardComponent {
  @Input() className = '';

  get cardClass() {
    return cn(
      'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
      this.className
    );
  }
}

@Component({
  selector: 'app-card-header',
  standalone: true,
  imports: [],
  template: `<div [class]="headerClass"><ng-content></ng-content></div>`,
  styles: []
})
export class CardHeaderComponent {
  @Input() className = '';

  get headerClass() {
    return cn(
      '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
      this.className
    );
  }
}

@Component({
  selector: 'app-card-title',
  standalone: true,
  imports: [],
  template: `<div [class]="titleClass"><ng-content></ng-content></div>`,
  styles: []
})
export class CardTitleComponent {
  @Input() className = '';

  get titleClass() {
    return cn('leading-none font-semibold', this.className);
  }
}

@Component({
  selector: 'app-card-description',
  standalone: true,
  imports: [],
  template: `<div [class]="descClass"><ng-content></ng-content></div>`,
  styles: []
})
export class CardDescriptionComponent {
  @Input() className = '';

  get descClass() {
    return cn('text-muted-foreground text-sm', this.className);
  }
}

@Component({
  selector: 'app-card-content',
  standalone: true,
  imports: [],
  template: `<div [class]="contentClass"><ng-content></ng-content></div>`,
  styles: []
})
export class CardContentComponent {
  @Input() className = '';

  get contentClass() {
    return cn('px-6', this.className);
  }
}

@Component({
  selector: 'app-card-footer',
  standalone: true,
  imports: [],
  template: `<div [class]="footerClass"><ng-content></ng-content></div>`,
  styles: []
})
export class CardFooterComponent {
  @Input() className = '';

  get footerClass() {
    return cn('flex items-center px-6 [.border-t]:pt-6', this.className);
  }
}

@Component({
  selector: 'app-card-action',
  standalone: true,
  imports: [],
  template: `<div [class]="actionClass"><ng-content></ng-content></div>`,
  styles: []
})
export class CardActionComponent {
  @Input() className = '';

  get actionClass() {
    return cn(
      'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
      this.className
    );
  }
}
