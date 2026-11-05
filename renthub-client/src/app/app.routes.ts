import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ApartmentsComponent } from './apartments/apartments.component';
import { ApartmentDetailsComponent } from './apartments/apartment-details.component';
import { FavouritesComponent } from './favourites/favourites.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { AuthGuard } from './core/auth.guard';
import { CreateApartmentComponent } from './apartments/create-apartment.component';
import { EditApartmentComponent } from './apartments/edit-apartment.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'apartments',
    component: ApartmentsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'apartments/:id',
    component: ApartmentDetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'create',
    component: CreateApartmentComponent,
    canActivate: [AuthGuard],
    data: { role: 'LANDLORD' },
  },
  {
    path: 'edit/:id',
    component: EditApartmentComponent,
    canActivate: [AuthGuard],
    data: { role: 'LANDLORD' },
  },
  {
    path: 'favourites',
    component: FavouritesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register.component').then(m => m.RegisterComponent),
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];