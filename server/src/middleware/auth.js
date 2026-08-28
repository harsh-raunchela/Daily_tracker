import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'tracker-super-secret-jwt-key-2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired authentication token' });
    }
    req.user = user;
    next();
  });
}
