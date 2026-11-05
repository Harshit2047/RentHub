import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApartmentCardComponent } from './apartment-card.component';
import { FavouriteService } from '../core/favourite.service';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../shared/toast.service';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('ApartmentCardComponent', () => {
  let component: ApartmentCardComponent;
  let fixture: ComponentFixture<ApartmentCardComponent>;
  let mockFavService: any;
  let mockAuthService: any;
  let mockToastService: any;

  const mockApartment: any = {
    id: 'apt-123',
    title: 'Luxury 2BHK Apartment',
    city: 'Jabalpur',
    state: 'MP',
    monthlyRent: 25000,
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    furnished: 'FURNISHED',
    status: 'AVAILABLE',
    images: [{ url: 'http://example.com/photo.jpg' }]
  };

  beforeEach(async () => {
    mockFavService = {
      getFavouriteIds: vi.fn().mockReturnValue(new Set(['apt-123'])),
      toggleFavourite: vi.fn().mockReturnValue(of(true)),
      favouriteIds$: of(new Set(['apt-123']))
    };
    mockAuthService = {
      isAuthenticated: vi.fn().mockReturnValue(true),
      hasRole: vi.fn().mockReturnValue(false)
    };
    mockToastService = {
      info: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
      error: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ApartmentCardComponent],
      providers: [
        provideRouter([{ path: 'login', component: class DummyComponent {} }]),
        { provide: FavouriteService, useValue: mockFavService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ApartmentCardComponent);
    component = fixture.componentInstance;
    component.apartment = mockApartment;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render apartment title and location', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.apartment-card-title')?.textContent).toContain('Luxury 2BHK Apartment');
    expect(compiled.textContent).toContain('Jabalpur');
  });

  it('should format rent correctly in INR', () => {
    const formatted = component.formatRent(25000);
    expect(formatted).toContain('25,000');
  });

  it('should prompt user to log in when unauthenticated user clicks favourite', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
    const mockEvent = new MouseEvent('click');
    const stopPropagationSpy = vi.spyOn(mockEvent, 'stopPropagation');

    component.onFavClick(mockEvent);

    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(mockToastService.warning).toHaveBeenCalledWith('Please log in to save favourite apartments.');
  });

  it('should toggle favourite when authenticated user clicks favourite button', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockFavService.toggleFavourite.mockReturnValue(of(true));
    const mockEvent = new MouseEvent('click');
    const stopPropagationSpy = vi.spyOn(mockEvent, 'stopPropagation');
    const emitSpy = vi.spyOn(component.toggleFavorite, 'emit');

    component.onFavClick(mockEvent);

    expect(mockFavService.toggleFavourite).toHaveBeenCalledWith('apt-123');
    expect(emitSpy).toHaveBeenCalledWith('apt-123');
  });
});
