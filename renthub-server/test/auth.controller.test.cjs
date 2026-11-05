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

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new tenant successfully', async () => {
      const response = await request(app)
        .post(`${API_BASE}/auth/register`)
        .send({
          fullName: 'New Tenant',
          email: 'newtenant@test.com',
          phone: '5555555555',
          password: 'password123',
          role: 'TENANT',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('newtenant@test.com');
      expect(response.body.user.role).toBe('TENANT');
    });

    it('should register a new landlord successfully', async () => {
      const response = await request(app)
        .post(`${API_BASE}/auth/register`)
        .send({
          fullName: 'New Landlord',
          email: 'newlandlord@test.com',
          phone: '5555555555',
          password: 'password123',
          role: 'LANDLORD',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.role).toBe('LANDLORD');
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post(`${API_BASE}/auth/register`)
        .send({
          email: 'incomplete@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post(`${API_BASE}/auth/login`)
        .send({
          email: 'tenant@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('tenant@test.com');
      expect(response.body.user.role).toBe('TENANT');
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post(`${API_BASE}/auth/login`)
        .send({
          email: 'tenant@test.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });

    it('should fail with non-existent user', async () => {
      const response = await request(app)
        .post(`${API_BASE}/auth/login`)
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    let tenantToken;

    beforeAll(async () => {
      const loginResp = await request(app)
        .post(`${API_BASE}/auth/login`)
        .send({
          email: 'tenant@test.com',
          password: 'password123',
        });
      tenantToken = loginResp.body.token;
    });

    it('should get current user profile with valid token', async () => {
      const response = await request(app)
        .get(`${API_BASE}/auth/me`)
        .set('Authorization', `Bearer ${tenantToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('tenant@test.com');
      expect(response.body.role).toBe('TENANT');
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get(`${API_BASE}/auth/me`);

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get(`${API_BASE}/auth/me`)
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});