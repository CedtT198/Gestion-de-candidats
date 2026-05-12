import request from 'supertest';
import app from '../../src/app';
import Candidate from '../../src/models/candidate.model';
import jwt from 'jsonwebtoken';

describe('Candidates Integration Tests', () => {
  let token: string;
  let candidateId: string;

  beforeAll(() => {
    // Génère un token JWT valide pour les tests
    token = jwt.sign(
      {
        userId: '1',
        email: 'admin@mail.com'
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1d'
      }
    );
  });

  // =====================
  // Tests Auth
  // =====================

  describe('POST /api/candidates/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/candidates/login')
        .send({
          email: 'admin@mail.com',
          password: 'admin'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.message).toBe('Connexion réussie');
      expect(typeof response.body.token).toBe('string');
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/candidates/login')
        .send({
          email: 'wrong@mail.com',
          password: 'admin'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Identifiants invalides');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/candidates/login')
        .send({
          email: 'admin@mail.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Identifiants invalides');
    });
  });

  // =====================
  // Tests Create Candidate
  // =====================

  describe('POST /api/candidates', () => {
    it('should create a candidate successfully with valid data', async () => {
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890'
      };

      const response = await request(app)
        .post('/api/candidates')
        .set('Authorization', `Bearer ${token}`)
        .send(candidateData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.firstName).toBe('John');
      expect(response.body.lastName).toBe('Doe');
      expect(response.body.email).toBe('john@example.com');
      expect(response.body.phone).toBe('1234567890');
      expect(response.body.status).toBe('pending');
      expect(response.body.deletedAt).toBeNull();

      candidateId = response.body._id;
    });

    it('should reject creation without authentication', async () => {
      const response = await request(app)
        .post('/api/candidates')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          phone: '1234567890'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token manquant');
    });

    it('should reject creation with invalid token', async () => {
      const response = await request(app)
        .post('/api/candidates')
        .set('Authorization', 'Bearer invalid_token')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          phone: '1234567890'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token invalide');
    });

    it('should reject creation with invalid firstName (too short)', async () => {
      const response = await request(app)
        .post('/api/candidates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'J',
          lastName: 'Doe',
          email: 'john2@example.com',
          phone: '1234567890'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject creation with invalid email', async () => {
      const response = await request(app)
        .post('/api/candidates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'not-an-email',
          phone: '1234567890'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject creation with invalid phone (too short)', async () => {
      const response = await request(app)
        .post('/api/candidates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john3@example.com',
          phone: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject creation with duplicate email', async () => {
      const candidateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'duplicate@example.com',
        phone: '1234567890'
      };

      // Créer le premier candidat
      await request(app)
        .post('/api/candidates')
        .set('Authorization', `Bearer ${token}`)
        .send(candidateData);

      // Essayer de créer un second avec le même email
      const response = await request(app)
        .post('/api/candidates')
        .set('Authorization', `Bearer ${token}`)
        .send(candidateData);

      expect(response.status).toBe(400);
    });
  });

  // =====================
  // Tests Get Candidates (List)
  // =====================

  describe('GET /api/candidates', () => {
    beforeEach(async () => {
      // Créer plusieurs candidats pour les tests
      await Candidate.create({
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        phone: '1111111111',
        status: 'pending'
      });

      await Candidate.create({
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@example.com',
        phone: '2222222222',
        status: 'validated'
      });

      await Candidate.create({
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie@example.com',
        phone: '3333333333',
        status: 'rejected',
        deletedAt: new Date()
      });
    });

    it('should get all non-deleted candidates', async () => {
      const response = await request(app)
        .get('/api/candidates')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.items).toBeDefined();
      expect(response.body.total).toBe(2);
      expect(response.body.page).toBe(1);
      expect(response.body.pages).toBeGreaterThan(0);
      expect(response.body.limit).toBe(10);
    });

    it('should paginate results correctly', async () => {
      const response = await request(app)
        .get('/api/candidates?page=1&limit=1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(1);
      expect(response.body.page).toBe(1);
      expect(response.body.pages).toBe(2);
    });

    it('should filter by search text', async () => {
      const response = await request(app)
        .get('/api/candidates?search=alice')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].firstName).toBe('Alice');
    });

    it('should filter by email search', async () => {
      const response = await request(app)
        .get('/api/candidates?search=bob@example.com')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].email).toBe('bob@example.com');
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/candidates?status=validated')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].status).toBe('validated');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app).get('/api/candidates');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token manquant');
    });

    it('should handle limit constraint (max 50)', async () => {
      const response = await request(app)
        .get('/api/candidates?limit=100')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.limit).toBe(50);
    });
  });

  // =====================
  // Tests Get Single Candidate
  // =====================

  describe('GET /api/candidates/:id', () => {
    beforeEach(async () => {
      const candidate = await Candidate.create({
        firstName: 'David',
        lastName: 'Lee',
        email: 'david@example.com',
        phone: '4444444444'
      });
      candidateId = candidate._id.toString();
    });

    it('should get a candidate by id', async () => {
      const response = await request(app)
        .get(`/api/candidates/${candidateId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.firstName).toBe('David');
      expect(response.body.email).toBe('david@example.com');
    });

    it('should return 404 for non-existent candidate', async () => {
      const fakeId = '000000000000000000000000';
      const response = await request(app)
        .get(`/api/candidates/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Candidat introuvable');
    });

    it('should not get a soft-deleted candidate', async () => {
      const deletedCandidate = await Candidate.create({
        firstName: 'Deleted',
        lastName: 'User',
        email: 'deleted@example.com',
        phone: '5555555555',
        deletedAt: new Date()
      });

      const response = await request(app)
        .get(`/api/candidates/${deletedCandidate._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Candidat introuvable');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app).get(`/api/candidates/${candidateId}`);

      expect(response.status).toBe(401);
    });
  });

  // =====================
  // Tests Update Candidate
  // =====================

  describe('PUT /api/candidates/:id', () => {
    beforeEach(async () => {
      const candidate = await Candidate.create({
        firstName: 'Emma',
        lastName: 'Wilson',
        email: 'emma@example.com',
        phone: '6666666666'
      });
      candidateId = candidate._id.toString();
    });

    it('should update a candidate with valid data', async () => {
      const response = await request(app)
        .put(`/api/candidates/${candidateId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Emily',
          lastName: 'Wilson'
        });

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe('Emily');
      expect(response.body.lastName).toBe('Wilson');
    });

    it('should allow partial updates', async () => {
      const response = await request(app)
        .put(`/api/candidates/${candidateId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Emmeline'
        });

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe('Emmeline');
      expect(response.body.email).toBe('emma@example.com');
    });

    it('should reject update with invalid email', async () => {
      const response = await request(app)
        .put(`/api/candidates/${candidateId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'not-an-email'
        });

      expect(response.status).toBe(400);
    });

    it('should reject update without authentication', async () => {
      const response = await request(app)
        .put(`/api/candidates/${candidateId}`)
        .send({ firstName: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  // =====================
  // Tests Delete Candidate (Soft Delete)
  // =====================

  describe('DELETE /api/candidates/:id', () => {
    beforeEach(async () => {
      const candidate = await Candidate.create({
        firstName: 'Frank',
        lastName: 'Miller',
        email: 'frank@example.com',
        phone: '7777777777'
      });
      candidateId = candidate._id.toString();
    });

    it('should soft-delete a candidate', async () => {
      const response = await request(app)
        .delete(`/api/candidates/${candidateId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Soft suppression effectuée');

      // Vérifier que le candidat est marqué comme supprimé
      const deletedCandidate = await Candidate.findById(candidateId);
      expect(deletedCandidate?.deletedAt).not.toBeNull();
    });

    it('should reject deletion without authentication', async () => {
      const response = await request(app).delete(`/api/candidates/${candidateId}`);

      expect(response.status).toBe(401);
    });
  });

  // =====================
  // Tests Validate Candidate
  // =====================

  describe('POST /api/candidates/:id/validate', () => {
    beforeEach(async () => {
      const candidate = await Candidate.create({
        firstName: 'Grace',
        lastName: 'Harris',
        email: 'grace@example.com',
        phone: '8888888888',
        status: 'pending'
      });
      candidateId = candidate._id.toString();
    });

    it('should validate a candidate', async () => {
      const response = await request(app)
        .post(`/api/candidates/${candidateId}/validate`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('valid');
      expect(response.body.valid).toBe(true);

      // Vérifier que le statut a été mis à jour
      const updatedCandidate = await Candidate.findById(candidateId);
      expect(updatedCandidate?.status).toBe('validated');
    });

    it('should not validate a deleted candidate', async () => {
      const deletedCandidate = await Candidate.create({
        firstName: 'Henry',
        lastName: 'Taylor',
        email: 'henry@example.com',
        phone: '9999999999',
        deletedAt: new Date()
      });

      const response = await request(app)
        .post(`/api/candidates/${deletedCandidate._id}/validate`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Candidat introuvable ou supprimé');
    });

    it('should reject validation without authentication', async () => {
      const response = await request(app).post(
        `/api/candidates/${candidateId}/validate`
      );

      expect(response.status).toBe(401);
    });
  });

  // =====================
  // Tests Comprehensive Workflow
  // =====================

  describe('Comprehensive Workflow', () => {
    it('should execute a complete candidate lifecycle', async () => {
      // 1. Login
      const loginRes = await request(app)
        .post('/api/candidates/login')
        .send({
          email: 'admin@mail.com',
          password: 'admin'
        });

      expect(loginRes.status).toBe(200);
      const workflowToken = loginRes.body.token;

      // 2. Create candidate
      const createRes = await request(app)
        .post('/api/candidates')
        .set('Authorization', `Bearer ${workflowToken}`)
        .send({
          firstName: 'Iris',
          lastName: 'Jackson',
          email: 'iris@example.com',
          phone: '1010101010'
        });

      expect(createRes.status).toBe(201);
      const id = createRes.body._id;

      // 3. Retrieve candidate
      const getRes = await request(app)
        .get(`/api/candidates/${id}`)
        .set('Authorization', `Bearer ${workflowToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.status).toBe('pending');

      // 4. Update candidate
      const updateRes = await request(app)
        .put(`/api/candidates/${id}`)
        .set('Authorization', `Bearer ${workflowToken}`)
        .send({
          phone: '1111111111'
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.phone).toBe('1111111111');

      // 5. Validate candidate
      const validateRes = await request(app)
        .post(`/api/candidates/${id}/validate`)
        .set('Authorization', `Bearer ${workflowToken}`);

      expect(validateRes.status).toBe(200);

      // 6. Verify candidate is validated
      const verifyRes = await request(app)
        .get(`/api/candidates/${id}`)
        .set('Authorization', `Bearer ${workflowToken}`);

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.status).toBe('validated');

      // 7. Delete candidate
      const deleteRes = await request(app)
        .delete(`/api/candidates/${id}`)
        .set('Authorization', `Bearer ${workflowToken}`);

      expect(deleteRes.status).toBe(200);

      // 8. Verify candidate is deleted
      const deletedRes = await request(app)
        .get(`/api/candidates/${id}`)
        .set('Authorization', `Bearer ${workflowToken}`);

      expect(deletedRes.status).toBe(404);
    });
  });
});
