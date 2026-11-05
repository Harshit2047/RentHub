const request = require('supertest');
const app = require('../src/server.js');

const API_BASE = '/api';

describe('Authorization Middleware', () => {
  let tenantToken;
  let landlordToken;

  beforeAll(async () => {
    // Create tenant and get token
    await request(app)
      .post(`${API_BASE}/auth/register`)
      .send({
        fullName: 'Test Tenant',
        email: 'tenant@test.com',
        phone: '1234567890',
        password: 'password123',
        role: 'TENANT',
      });

    const tenantLogin = await request(app)
      .post(`${API_BASE}/auth/login`)
      .send({
        email: 'tenant@test.com',
        password: 'password123',
      });
    tenantToken = tenantLogin.body.token;

    // Create landlord and get token
    await request(app)
      .post(`${API_BASE}/auth/register`)
      .send({
        fullName: 'Test Landlord',
        email: 'landlord@test.com',
        phone: '0987654321',
        password: 'password123',
        role: 'LANDLORD',
      });

    const landlordLogin = await request(app)
      .post(`${API_BASE}/auth/login`)
      .send({
        email: 'landlord@test.com',
        password: 'password123',
      });
    landlordToken = landlordLogin.body.token;
  });

  describe('TENANT role guard', () => {
    it('should allow tenant access to tenant-only endpoints', async () => {
      const response = await request(app)
        .get(`${API_BASE}/dashboard/tenant`)
        .set('Authorization', `Bearer ${tenantToken}`);

      expect(response.status).toBe(200);
    });

    it('should forbid landlord access to tenant-only endpoints', async () => {
      const response = await request(app)
        .get(`${API_BASE}/dashboard/tenant`)
        .set('Authorization', `Bearer ${landlordToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('LANDLORD role guard', () => {
    it('should allow landlord access to landlord-only endpoints', async () => {
      const response = await request(app)
        .get(`${API_BASE}/dashboard/landlord`)
        .set('Authorization', `Bearer ${landlordToken}`);

      expect(response.status).toBe(200);
    });

    it('should forbid tenant access to landlord-only endpoints', async () => {
      const response = await request(app)
        .get(`${API_BASE}/dashboard/landlord`)
        .set('Authorization', `Bearer ${tenantToken}`);

      expect(response.status).toBe(403);
    });
  });
});