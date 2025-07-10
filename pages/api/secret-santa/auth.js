import fs from 'fs';
import path from 'path';

// Path to our data file
const dataFilePath = path.join(process.cwd(), 'data', 'secret-santa.json');

// Read data from file
function readData() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return { users: [], events: [], assignments: [] };
    }
    return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  } catch (error) {
    console.error('Error reading data file:', error);
    return { users: [], events: [], assignments: [] };
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action } = req.query;
  const data = readData();

  if (!action) {
    return res.status(400).json({ error: 'Action parameter is required' });
  }

  // Handle signup
  if (action === 'signup') {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if username already exists
    if (data.users.some(u => u.username === username)) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      password, // In a real app, this should be hashed
      role: 'participant' // Default to participant role
    };

    // Add user to data file (using the data API)
    try {
      const response = await fetch(`${req.headers.origin}/api/secret-santa/data?type=users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json(errorData);
      }

      const userData = await response.json();

      // Create a session token (in a real app, use a proper JWT or session mechanism)
      const sessionToken = Buffer.from(`${userData.id}:${userData.role}`).toString('base64');

      return res.status(201).json({
        user: userData,
        token: sessionToken
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }
  }

  // Handle login
  if (action === 'login') {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username
    const user = data.users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check password (in a real app, use proper password hashing)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Create a session token (in a real app, use a proper JWT or session mechanism)
    const sessionToken = Buffer.from(`${user.id}:${user.role}`).toString('base64');

    // Don't return the password in the response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      user: userWithoutPassword,
      token: sessionToken
    });
  }

  // Handle verify token
  if (action === 'verify') {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    try {
      // Decode token (in a real app, use proper JWT verification)
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId, role] = decoded.split(':');

      // Find user by ID
      const user = data.users.find(u => u.id === userId);

      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Don't return the password in the response
      const { password, ...userWithoutPassword } = user;

      return res.status(200).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  // Handle logout (client-side only in this implementation)
  if (action === 'logout') {
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  return res.status(400).json({ error: 'Invalid action parameter' });
}