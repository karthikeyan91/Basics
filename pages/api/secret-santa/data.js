import fs from 'fs';
import path from 'path';

// Path to our data file
const dataFilePath = path.join(process.cwd(), 'data', 'secret-santa.json');

// Ensure the data directory exists
function ensureDataDirectoryExists() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Initialize data file if it doesn't exist
function initializeDataFile() {
  ensureDataDirectoryExists();

  if (!fs.existsSync(dataFilePath)) {
    const initialData = {
      users: [],
      events: [],
      assignments: []
    };
    fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
    return initialData;
  }

  return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
}

// Read data from file
function readData() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return initializeDataFile();
    }
    return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  } catch (error) {
    console.error('Error reading data file:', error);
    return { users: [], events: [], assignments: [] };
  }
}

// Write data to file
function writeData(data) {
  try {
    ensureDataDirectoryExists();
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
}

export default async function handler(req, res) {
  // Only allow specific methods
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Initialize data if needed
  let data = readData();

  // Handle GET request - retrieve data
  if (req.method === 'GET') {
    const { type, id, userId, role } = req.query;

    // If no type specified, return error
    if (!type) {
      return res.status(400).json({ error: 'Type parameter is required' });
    }

    // Return data based on type
    switch (type) {
      case 'users':
        // If admin, return all users
        if (role === 'admin') {
          return res.status(200).json(id ? data.users.find(u => u.id === id) : data.users);
        } 
        // If a specific user ID is requested and the requester is a participant
        else if (id && userId) {
          // Check if the requester has an assignment where the requested user is the receiver
          const hasAssignment = data.assignments.some(a => 
            a.giverId === userId && a.receiverId === id
          );

          // Allow access if the requester is requesting their own info or has an assignment with the requested user
          if (id === userId || hasAssignment) {
            return res.status(200).json(data.users.find(u => u.id === id));
          }
        } 
        // If no specific ID is requested, return only the requesting user
        else if (userId) {
          return res.status(200).json(data.users.find(u => u.id === userId));
        }

        return res.status(403).json({ error: 'Unauthorized' });

      case 'events':
        // If admin, return all events, otherwise return events the user is part of
        if (role === 'admin') {
          return res.status(200).json(id ? data.events.find(e => e.id === id) : data.events);
        } else if (userId) {
          const userEvents = data.events.filter(e => 
            e.participants.includes(userId) || e.adminId === userId
          );
          return res.status(200).json(id ? userEvents.find(e => e.id === id) : userEvents);
        }
        return res.status(403).json({ error: 'Unauthorized' });

      case 'assignments':
        // If admin, return all assignments for an event, otherwise return only the user's assignment
        if (id) {
          const event = data.events.find(e => e.id === id);
          if (!event) {
            return res.status(404).json({ error: 'Event not found' });
          }

          if (role === 'admin' || event.adminId === userId) {
            return res.status(200).json(data.assignments.filter(a => a.eventId === id));
          } else if (userId) {
            return res.status(200).json(
              data.assignments.find(a => a.eventId === id && a.giverId === userId)
            );
          }
        }
        return res.status(400).json({ error: 'Event ID is required' });

      default:
        return res.status(400).json({ error: 'Invalid type parameter' });
    }
  }

  // Handle POST request - create new data
  if (req.method === 'POST') {
    const { type, userId, role } = req.query;
    const payload = req.body;

    if (!type || !payload) {
      return res.status(400).json({ error: 'Type parameter and request body are required' });
    }

    switch (type) {
      case 'users':
        // Anyone can create a user (sign up)
        if (!payload.username || !payload.password) {
          return res.status(400).json({ error: 'Username and password are required' });
        }

        // Check if username already exists
        if (data.users.some(u => u.username === payload.username)) {
          return res.status(409).json({ error: 'Username already exists' });
        }

        // Create new user
        const newUser = {
          id: Date.now().toString(),
          username: payload.username,
          password: payload.password, // In a real app, this should be hashed
          role: payload.role || 'participant' // Default to participant role
        };

        data.users.push(newUser);
        writeData(data);

        // Don't return the password in the response
        const { password, ...userWithoutPassword } = newUser;
        return res.status(201).json(userWithoutPassword);

      case 'events':
        // Only authenticated users can create events
        if (!userId) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        if (!payload.name) {
          return res.status(400).json({ error: 'Event name is required' });
        }

        // Create new event
        const newEvent = {
          id: Date.now().toString(),
          name: payload.name,
          description: payload.description || '',
          adminId: userId,
          participants: payload.participants || [],
          created: new Date().toISOString()
        };

        data.events.push(newEvent);
        writeData(data);

        return res.status(201).json(newEvent);

      case 'assignments':
        // Only admin can generate assignments
        if (role !== 'admin' && !data.events.some(e => e.id === payload.eventId && e.adminId === userId)) {
          return res.status(403).json({ error: 'Only the event admin can generate assignments' });
        }

        if (!payload.eventId) {
          return res.status(400).json({ error: 'Event ID is required' });
        }

        const event = data.events.find(e => e.id === payload.eventId);
        if (!event) {
          return res.status(404).json({ error: 'Event not found' });
        }

        // Check if there are enough participants
        if (event.participants.length < 3) {
          return res.status(400).json({ error: 'At least 3 participants are required' });
        }

        // Generate assignments
        const givers = [...event.participants];
        const receivers = [...event.participants];
        let validAssignment = false;
        let attempts = 0;
        let newAssignments = [];

        // Try to generate valid assignments (no one gets themselves)
        while (!validAssignment && attempts < 100) {
          attempts++;

          // Shuffle the receivers array
          for (let i = receivers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
          }

          // Check if any person got themselves
          const selfAssignment = givers.some((giver, index) => giver === receivers[index]);

          if (!selfAssignment) {
            validAssignment = true;
            newAssignments = givers.map((giver, index) => ({
              id: Date.now().toString() + index,
              eventId: payload.eventId,
              giverId: giver,
              receiverId: receivers[index],
              created: new Date().toISOString()
            }));
          }
        }

        if (!validAssignment) {
          return res.status(500).json({ error: 'Failed to generate valid assignments' });
        }

        // Remove any existing assignments for this event
        data.assignments = data.assignments.filter(a => a.eventId !== payload.eventId);

        // Add new assignments
        data.assignments.push(...newAssignments);
        writeData(data);

        return res.status(201).json(newAssignments);

      default:
        return res.status(400).json({ error: 'Invalid type parameter' });
    }
  }

  // Handle PUT request - update existing data
  if (req.method === 'PUT') {
    const { type, id, userId, role } = req.query;
    const payload = req.body;

    if (!type || !id || !payload) {
      return res.status(400).json({ error: 'Type parameter, ID, and request body are required' });
    }

    switch (type) {
      case 'users':
        // Users can only update their own data, admins can update any user
        const userToUpdate = data.users.find(u => u.id === id);

        if (!userToUpdate) {
          return res.status(404).json({ error: 'User not found' });
        }

        if (role !== 'admin' && userId !== id) {
          return res.status(403).json({ error: 'Unauthorized' });
        }

        // Update user data
        Object.assign(userToUpdate, payload);
        writeData(data);

        // Don't return the password in the response
        const { password, ...userWithoutPassword } = userToUpdate;
        return res.status(200).json(userWithoutPassword);

      case 'events':
        // Only the event admin can update the event
        const eventToUpdate = data.events.find(e => e.id === id);

        if (!eventToUpdate) {
          return res.status(404).json({ error: 'Event not found' });
        }

        if (role !== 'admin' && eventToUpdate.adminId !== userId) {
          return res.status(403).json({ error: 'Only the event admin can update the event' });
        }

        // Update event data
        Object.assign(eventToUpdate, payload);
        writeData(data);

        return res.status(200).json(eventToUpdate);

      default:
        return res.status(400).json({ error: 'Invalid type parameter' });
    }
  }

  // Handle DELETE request - delete data
  if (req.method === 'DELETE') {
    const { type, id, userId, role } = req.query;

    if (!type || !id) {
      return res.status(400).json({ error: 'Type parameter and ID are required' });
    }

    switch (type) {
      case 'users':
        // Only admins can delete users
        if (role !== 'admin') {
          return res.status(403).json({ error: 'Only admins can delete users' });
        }

        const userIndex = data.users.findIndex(u => u.id === id);

        if (userIndex === -1) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Delete user
        const deletedUser = data.users.splice(userIndex, 1)[0];
        writeData(data);

        return res.status(200).json({ message: 'User deleted successfully', user: deletedUser });

      case 'events':
        // Only the event admin can delete the event
        const eventIndex = data.events.findIndex(e => e.id === id);

        if (eventIndex === -1) {
          return res.status(404).json({ error: 'Event not found' });
        }

        if (role !== 'admin' && data.events[eventIndex].adminId !== userId) {
          return res.status(403).json({ error: 'Only the event admin can delete the event' });
        }

        // Delete event and its assignments
        const deletedEvent = data.events.splice(eventIndex, 1)[0];
        data.assignments = data.assignments.filter(a => a.eventId !== id);
        writeData(data);

        return res.status(200).json({ message: 'Event deleted successfully', event: deletedEvent });

      default:
        return res.status(400).json({ error: 'Invalid type parameter' });
    }
  }
}
