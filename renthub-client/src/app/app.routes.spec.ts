import { routes } from './app.routes';
import { HomeComponent } from './home/home.component';
import { ApartmentsComponent } from './apartments/apartments.component';
import { ApartmentDetailsComponent } from './apartments/apartment-details.component';
import { CreateApartmentComponent } from './apartments/create-apartment.component';
import { EditApartmentComponent } from './apartments/edit-apartment.component';
import { FavouritesComponent } from './favourites/favourites.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { AuthGuard } from './core/auth.guard';

describe('AppRoutingModule / Routes Configuration', () => {
  it('should have default redirect to /home', () => {
    const defaultRoute = routes.find(r => r.path === '');
    expect(defaultRoute).toBeDefined();
    expect(defaultRoute?.redirectTo).toBe('/home');
    expect(defaultRoute?.pathMatch).toBe('full');
  });

  it('should route /home to HomeComponent', () => {
    const homeRoute = routes.find(r => r.path === 'home');
    expect(homeRoute).toBeDefined();
    expect(homeRoute?.component).toBe(HomeComponent);
  });

  it('should protect /apartments with AuthGuard', () => {
    const aptRoute = routes.find(r => r.path === 'apartments');
    expect(aptRoute).toBeDefined();
    expect(aptRoute?.component).toBe(ApartmentsComponent);
    expect(aptRoute?.canActivate).toContain(AuthGuard);
  });

  it('should protect /apartments/:id with AuthGuard', () => {
    const detailsRoute = routes.find(r => r.path === 'apartments/:id');
    expect(detailsRoute).toBeDefined();
    expect(detailsRoute?.component).toBe(ApartmentDetailsComponent);
    expect(detailsRoute?.canActivate).toContain(AuthGuard);
  });

  it('should protect /create with AuthGuard and require LANDLORD role', () => {
    const createRoute = routes.find(r => r.path === 'create');
    expect(createRoute).toBeDefined();
    expect(createRoute?.component).toBe(CreateApartmentComponent);
    expect(createRoute?.canActivate).toContain(AuthGuard);
    expect(createRoute?.data?.['role']).toBe('LANDLORD');
  });

  it('should protect /edit/:id with AuthGuard and require LANDLORD role', () => {
    const editRoute = routes.find(r => r.path === 'edit/:id');
    expect(editRoute).toBeDefined();
    expect(editRoute?.component).toBe(EditApartmentComponent);
    expect(editRoute?.canActivate).toContain(AuthGuard);
    expect(editRoute?.data?.['role']).toBe('LANDLORD');
  });

  it('should protect /favourites with AuthGuard', () => {
    const favRoute = routes.find(r => r.path === 'favourites');
    expect(favRoute).toBeDefined();
    expect(favRoute?.component).toBe(FavouritesComponent);
    expect(favRoute?.canActivate).toContain(AuthGuard);
  });

  it('should protect /dashboard with AuthGuard', () => {
    const dashRoute = routes.find(r => r.path === 'dashboard');
    expect(dashRoute).toBeDefined();
    expect(dashRoute?.component).toBe(DashboardComponent);
    expect(dashRoute?.canActivate).toContain(AuthGuard);
  });

  it('should route wildcard ** to NotFoundComponent', () => {
    const wildcardRoute = routes.find(r => r.path === '**');
    expect(wildcardRoute).toBeDefined();
    expect(wildcardRoute?.component).toBe(NotFoundComponent);
  });
});
