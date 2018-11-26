import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <header class="flex-none-auto">
      <app-header></app-header>
    </header>

    <main id="main" class="container flex-grow-auto bg-white shadow-lg p-4">
      <router-outlet></router-outlet>
    </main>

    <footer class="flex-none-auto">
      <app-footer></app-footer>
    </footer>
  `,
  styles: []
})
export class AppComponent {
  title = 'future-fellows';
}
