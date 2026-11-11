import { Router } from 'express';

const router = Router();

const STAFF_USERS = [
  {
    id: 'u_admin',
    email: 'admin@nalam.care',
    name: 'Dr. Anand Kumar',
    role: 'ADMIN',
    department: 'Hospital Administration',
    initials: 'AK'
  },
  {
    id: 'u_doctor',
    email: 'doctor@nalam.care',
    name: 'Dr. Meera Sharma',
    role: 'DOCTOR',
    department: 'Cardiology',
    initials: 'MS'
  },
  {
    id: 'u_receptionist',
    email: 'frontdesk@nalam.care',
    name: 'Suresh Raina',
    role: 'RECEPTIONIST',
    department: 'Patient Admission & Front Desk',
    initials: 'SR'
  }
];

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, role } = req.body;

  // Find user by email or fallback to role or admin
  let user = STAFF_USERS.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user && role) {
    user = STAFF_USERS.find(u => u.role === role);
  }
  if (!user) {
    user = STAFF_USERS[0]; // Default admin
  }

  res.json({
    token: 'jwt_mock_nalam_' + Buffer.from(JSON.stringify(user)).toString('base64'),
    user
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer jwt_mock_nalam_')) {
    try {
      const raw = authHeader.replace('Bearer jwt_mock_nalam_', '');
      const user = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
      return res.json({ user });
    } catch {
      // Fallback
    }
  }
  res.json({ user: STAFF_USERS[0] });
});

export default router;

