import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="nf-page">
      <div class="nf-code">404</div>
      <h1 class="nf-title">Page Not Found</h1>
      <p class="nf-desc">The page you're looking for doesn't exist or has been moved.</p>
      <a routerLink="/home" class="btn-primary" style="display:inline-flex;padding:0.65rem 1.5rem;border-radius:8px;font-size:0.9rem;margin-top:1.5rem;">
        Back to Home
      </a>
    </div>
  `,
  styles: [`
    .nf-page {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 60vh; text-align: center; padding: 2rem;
    }
    .nf-code {
      font-size: 7rem; font-weight: 900; line-height: 1;
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text; letter-spacing: -4px;
    }
    .nf-title { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin: 0.5rem 0 0; }
    .nf-desc  { font-size: 0.95rem; color: #64748b; margin: 0.5rem 0 0; max-width: 360px; }
  `],
})
export class NotFoundComponent {}
