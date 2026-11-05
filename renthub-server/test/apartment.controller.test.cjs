const request = require('supertest');
const app = require('../src/server.js');

const API_BASE = '/api';

jest.mock('../src/database/prismaClient.js', () => {
  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    apartment: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
      findUnique: jest.fn(),
    },
    favourite: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    inquiry: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  return jest.fn(() => mockPrisma);
});

describe('Apartment CRUD Endpoints', () => {
  describe('POST /api/apartments', () => {
    it('should create a new apartment with valid data', async () => {
      const response = await request(app)
        .post(`${API_BASE}/apartments`)
        .send({
          title: 'Modern 2BR Downtown',
          description: 'A beautiful modern apartment in the downtown area',
          address: '123 Main Street',
          city: 'New York',
          state: 'NY',
          pincode: '10001',
          monthlyRent: 2500,
          securityDeposit: 2500,
          bedrooms: 2,
          bathrooms: 1,
          area: 1200,
          furnished: 'FURNISHED',
          vegetarian: 'ALLOWED',
          availability: 'AVAILABLE',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Modern 2BR Downtown');
      expect(response.body.monthlyRent).toBe(2500);
    });

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post(`${API_BASE}/apartments`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/apartments', () => {
    it('should fetch all apartments with pagination', async () => {
      const mockApartments = [
        {
          id: '1',
          title: 'Test Apartment',
          address: '123 Test St',
          city: 'New York',
          state: 'NY',
          pincode: '10001',
          monthlyRent: 2000,
          securityDeposit: 1500,
          bedrooms: 2,
          bathrooms: 1,
          area: 1000,
          furnished: 'FURNISHED',
          vegetarian: 'ALLOWED',
          availability: 'AVAILABLE',
          images: [],
          landlord: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      app.prismaClientMock.apartment.findMany.mockResolvedValue(mockApartments);

      const response = await request(app).get(`${API_BASE}/apartments`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('apartments');
      expect(response.body).toHaveProperty('total');
      expect(response.body.total).toBe(1);
    });

    it('should filter apartments by city', async () => {
      const mockApartments = [
        {
          id: '1',
          title: 'NY Apartment',
          address: '1 NY St',
          city: 'New York',
          state: 'NY',
          pincode: '10001',
          monthlyRent: 2000,
          securityDeposit: 1500,
          bedrooms: 1,
          bathrooms: 1,
          area: 800,
          furnished: 'FURNISHED',
          vegetarian: 'ALLOWED',
          availability: 'AVAILABLE',
          images: [],
          landlord: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      app.prismaClientMock.apartment.findMany.mockResolvedValue(mockApartments);

      const response = await request(app).get(`${API_BASE}/apartments?city=New York`);

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(1);
    });
  });

  describe('GET /api/apartments/:id', () => {
    it('should fetch a single apartment by ID', async () => {
      app.prismaClientMock.apartment.findUnique.mockResolvedValue({
        id: '1',
        title: 'Single Apartment',
        address: '456 Test Ave',
        city: 'Boston',
        state: 'MA',
        pincode: '02101',
        monthlyRent: 2200,
        securityDeposit: 2000,
        bedrooms: 2,
        bathrooms: 2,
        area: 1100,
        furnished: 'FURNISHED',
        vegetarian: 'ALLOWED',
        availability: 'AVAILABLE',
        images: [],
        landlord: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app).get(`${API_BASE}/apartments/1`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', '1');
      expect(response.body.title).toBe('Single Apartment');
    });

    it('should return 404 for non-existent apartment', async () => {
      app.prismaClientMock.apartment.findUnique.mockResolvedValue(null);

      const response = await request(app).get(`${API_BASE}/apartments/999`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/apartments/:id', () => {
    it('should update an apartment', async () => {
      app.prismaClientMock.apartment.findUnique.mockResolvedValue({
        id: '1',
        title: 'Original',
        address: '789 Original St',
        city: 'Chicago',
        state: 'IL',
        pincode: '60601',
        monthlyRent: 2000,
        securityDeposit: 1500,
        bedrooms: 2,
        bathrooms: 1,
        area: 1000,
        furnished: 'FURNISHED',
        vegetarian: 'ALLOWED',
        availability: 'AVAILABLE',
        images: [],
        landlord: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      app.prismaClientMock.apartment.update.mockResolvedValue({
        id: '1',
        title: 'Updated',
        address: '789 Original St',
        city: 'Chicago',
        state: 'IL',
        pincode: '60601',
        monthlyRent: 2500,
        securityDeposit: 1500,
        bedrooms: 2,
        bathrooms: 1,
        area: 1000,
        furnished: 'FURNISHED',
        vegetarian: 'ALLOWED',
        availability: 'AVAILABLE',
        images: [],
        landlord: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .patch(`${API_BASE}/apartments/1`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated');
    });

    it('should return 404 for non-existent apartment', async () => {
      app.prismaClientMock.apartment.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch(`${API_BASE}/apartments/999`)
        .send({ title: 'Does Not Exist' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/apartments/:id', () => {
    it('should delete an apartment', async () => {
      app.prismaClientMock.apartment.delete.mockResolvedValue({
        id: '1',
        title: 'Deleted',
        address: '111 Delete St',
        city: 'Seattle',
        state: 'WA',
        pincode: '98101',
        monthlyRent: 1800,
        securityDeposit: 1000,
        bedrooms: 1,
        bathrooms: 1,
        area: 600,
        furnished: 'FURNISHED',
        vegetarian: 'ALLOWED',
        availability: 'AVAILABLE',
        images: [],
        landlord: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app).delete(`${API_BASE}/apartments/1`);

      expect(response.status).toBe(200);
      expect(response.body).toBeTruthy();
    });

    it('should return 404 for non-existent apartment', async () => {
      app.prismaClientMock.apartment.delete.mockResolvedValue(null);

      const response = await request(app).delete(`${API_BASE}/apartments/999`);

      expect(response.status).toBe(404);
    });
  });
});