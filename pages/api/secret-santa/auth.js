import supabase from '../../../lib/supabase';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action } = req.query;

  if (!action) {
    return res.status(400).json({ error: 'Action parameter is required' });
  }

  // Handle signup
  if (action === 'signup') {
    const { username, password, role = 'participant' } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
      // Check if username already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('signup')
        .select('username')
        .eq('username', username)
        .limit(1);

      if (checkError) {
        console.error('Error checking existing user:', checkError);
        return res.status(500).json({ error: 'Failed to check existing user' });
      }

      if (existingUsers && existingUsers.length > 0) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      // Create new user in Supabase
      const { data: newUser, error: createError } = await supabase
        .from('signup')
        .insert([
          {
            username,
            password, // In a real app, this should be hashed
            role
          }
        ])
        .select();

      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      const userData = newUser[0];

      // Create a session token
      const sessionToken = Buffer.from(`${userData.id}:${userData.role}`).toString('base64');

      // Don't return the password in the response
      const { password: _, ...userWithoutPassword } = userData;

      return res.status(201).json({
        user: userWithoutPassword,
        token: sessionToken
      });
    } catch (error) {
      console.error('Error in signup process:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }
  }

  // Handle login
  if (action === 'login') {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
      // Find user by username
      const { data: users, error: findError } = await supabase
        .from('signup')
        .select('*')
        .eq('username', username)
        .limit(1);

      if (findError) {
        console.error('Error finding user:', findError);
        return res.status(500).json({ error: 'Failed to find user' });
      }

      if (!users || users.length === 0) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const user = users[0];

      // Check password (in a real app, use proper password hashing)
      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Create a session token
      const sessionToken = Buffer.from(`${user.id}:${user.role}`).toString('base64');

      // Don't return the password in the response
      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).json({
        user: userWithoutPassword,
        token: sessionToken
      });
    } catch (error) {
      console.error('Error in login process:', error);
      return res.status(500).json({ error: 'Failed to login' });
    }
  }

  // Handle verify token
  if (action === 'verify') {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    try {
      // Decode token
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId, role] = decoded.split(':');

      // Find user by ID
      const { data: user, error: findError } = await supabase
        .from('signup')
        .select('*')
        .eq('id', userId)
        .limit(1);

      if (findError) {
        console.error('Error finding user:', findError);
        return res.status(500).json({ error: 'Failed to verify token' });
      }

      if (!user || user.length === 0) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Don't return the password in the response
      const { password, ...userWithoutPassword } = user[0];

      return res.status(200).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  // Handle logout
  if (action === 'logout') {
    // With Supabase, we could invalidate the session, but for now we'll keep it simple
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  return res.status(400).json({ error: 'Invalid action parameter' });
}
