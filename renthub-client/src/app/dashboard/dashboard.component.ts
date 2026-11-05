import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';
import { LandlordDashboardComponent } from './landlord-dashboard.component';
import { TenantDashboardComponent } from './tenant-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LandlordDashboardComponent, TenantDashboardComponent],
  template: `
    <app-landlord-dashboard *ngIf="isLandlord; else tenantView"></app-landlord-dashboard>
    <ng-template #tenantView>
      <app-tenant-dashboard></app-tenant-dashboard>
    </ng-template>
  `,
  styles: [],
})
export class DashboardComponent {
  constructor(private authService: AuthService) {}

  get isLandlord(): boolean {
    return this.authService.hasRole('LANDLORD');
  }
}
