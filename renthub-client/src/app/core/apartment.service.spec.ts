import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApartmentService } from './apartment.service';
import { ApartmentFilters, ApartmentFormValues } from '../models/apartment.model';

describe('ApartmentService', () => {
  let service: ApartmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApartmentService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApartmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getApartments', () => {
    it('should fetch apartments with pagination and filtering', () => {
      const filters: ApartmentFilters = {
        city: 'Jabalpur',
        minRent: 10000,
        maxRent: 30000,
        bedrooms: 2,
      };

      service.getApartments(filters, 1, 10).subscribe((result) => {
        expect(result.apartments.length).toBe(1);
        expect(result.apartments[0].title).toBe('Sunny 2BHK');
        expect(result.total).toBe(1);
      });

      const req = httpMock.expectOne((r) => r.url.includes('/api/apartments') && r.params.has('city') === false);
      expect(req.request.method).toBe('GET');
      req.flush({
        success: true,
        data: {
          apartments: [
            {
              id: 'apt-1',
              title: 'Sunny 2BHK',
              address: 'Civil Lines',
              city: 'Jabalpur',
              monthlyRent: 22000,
              bedrooms: 2,
              bathrooms: 2,
              furnished: 'FURNISHED',
            },
          ],
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
      });
    });

    it('should return empty apartments on error', () => {
      service.getApartments({}, 1, 10).subscribe((result) => {
        expect(result.apartments.length).toBe(0);
        expect(result.total).toBe(0);
      });

      const req = httpMock.expectOne((r) => r.url.includes('/api/apartments'));
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getApartmentById', () => {
    it('should fetch single apartment by ID', () => {
      service.getApartmentById('apt-123').subscribe((apt) => {
        expect(apt).toBeTruthy();
        expect(apt?.id).toBe('apt-123');
        expect(apt?.title).toBe('Cozy 1BHK');
      });

      const req = httpMock.expectOne('http://localhost:3000/api/apartments/apt-123');
      expect(req.request.method).toBe('GET');
      req.flush({
        success: true,
        data: {
          id: 'apt-123',
          title: 'Cozy 1BHK',
          address: 'Main Road',
          city: 'Mumbai',
          monthlyRent: 35000,
          bedrooms: 1,
          bathrooms: 1,
          furnished: 'FURNISHED',
        },
      });
    });

    it('should return null when apartment not found', () => {
      service.getApartmentById('999').subscribe((apt) => {
        expect(apt).toBeNull();
      });

      const req = httpMock.expectOne('http://localhost:3000/api/apartments/999');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createApartment', () => {
    it('should create apartment successfully', () => {
      const apartment: ApartmentFormValues = {
        title: 'New Apartment',
        description: 'A great apartment',
        address: '123 Test St',
        city: 'Jabalpur',
        state: 'MP',
        pincode: '482001',
        monthlyRent: 20000,
        securityDeposit: 40000,
        bedrooms: 2,
        bathrooms: 2,
        area: 1100,
        furnished: 'FURNISHED',
        vegetarian: 'ALLOWED',
        availability: 'AVAILABLE',
        amenities: ['WiFi', 'Parking'],
      };

      service.createApartment(apartment).subscribe((created) => {
        expect(created).toBeTruthy();
        expect(created?.title).toBe('New Apartment');
      });

      const req = httpMock.expectOne('http://localhost:3000/api/apartments/');
      expect(req.request.method).toBe('POST');
      req.flush({
        success: true,
        data: { id: 'apt-new', ...apartment },
      });
    });
  });
});
