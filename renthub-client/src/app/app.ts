import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/navbar.component';
import { FooterComponent } from './shared/footer.component';
import { ToastComponent } from './shared/toast.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, FooterComponent, ToastComponent],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('renthub-client');

  /** Hide shell chrome on auth pages */
  isAuthPage = false;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.isAuthPage = ['/login', '/register'].includes(e.urlAfterRedirects);
        this.cdr.markForCheck();
      });
  }
}
