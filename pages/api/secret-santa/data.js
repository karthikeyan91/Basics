import supabase from '../../../lib/supabase';

export default async function handler(req, res) {
  // Only allow specific methods
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle GET request - retrieve data
  if (req.method === 'GET') {
    const { type, id, userId, role } = req.query;

    // If no type specified, return error
    if (!type) {
      return res.status(400).json({ error: 'Type parameter is required' });
    }

    // Return data based on type
    switch (type) {
      case 'signup':
        try {
          // If admin, return all users
          if (role === 'admin') {
            let query = supabase.from('signup').select('*');

            if (id) {
              query = query.eq('id', id).single();
            }

            const { data, error } = await query;

            if (error) throw error;

            // Remove passwords from response
            const usersWithoutPasswords = Array.isArray(data) 
              ? data.map(({ password, ...user }) => user) 
              : { ...data, password: undefined };

            return res.status(200).json(usersWithoutPasswords);
          } 
          // If a specific user ID is requested and the requester is a participant
          else if (id && userId) {
            // Check if the requester has an assignment where the requested user is the receiver
            const { data: assignments, error: assignmentError } = await supabase
              .from('assignments')
              .select('*')
              .eq('giverId', userId)
              .eq('receiverId', id);

            if (assignmentError) throw assignmentError;

            const hasAssignment = assignments && assignments.length > 0;

            // Allow access if the requester is requesting their own info or has an assignment with the requested user
            if (id === userId || hasAssignment) {
              const { data: user, error: userError } = await supabase
                .from('signup')
                .select('*')
                .eq('id', id)
                .single();

              if (userError) throw userError;

              // Remove password from response
              const { password, ...userWithoutPassword } = user;

              return res.status(200).json(userWithoutPassword);
            }
          } 
          // If no specific ID is requested, return only the requesting user
          else if (userId) {
            const { data: user, error: userError } = await supabase
              .from('signup')
              .select('*')
              .eq('id', userId)
              .single();

            if (userError) throw userError;

            // Remove password from response
            const { password, ...userWithoutPassword } = user;

            return res.status(200).json(userWithoutPassword);
          }

          return res.status(403).json({ error: 'Unauthorized' });
        } catch (error) {
          console.error('Error retrieving users:', error);
          return res.status(500).json({ error: 'Failed to retrieve users' });
        }

      case 'events':
        try {
          // If admin, return all events
          if (role === 'admin') {
            let query = supabase.from('events').select('*');

            if (id) {
              query = query.eq('id', id).single();
            }

            const { data, error } = await query;

            if (error) throw error;

            return res.status(200).json(data);
          } 
          // Otherwise return events the user is part of
          else if (userId) {
            // First get events where user is admin
            const { data: adminEvents, error: adminError } = await supabase
              .from('events')
              .select('*')
              .eq('adminId', userId);

            if (adminError) throw adminError;

            // Then get events where user is a participant
            const { data: participantEvents, error: participantError } = await supabase
              .from('events')
              .select('*')
              .contains('participants', [userId]);

            if (participantError) throw participantError;

            // Combine and deduplicate events
            const allEvents = [...(adminEvents || []), ...(participantEvents || [])];
            const uniqueEvents = Array.from(new Map(allEvents.map(event => [event.id, event])).values());

            if (id) {
              const event = uniqueEvents.find(e => e.id === id);
              return res.status(200).json(event || null);
            }

            return res.status(200).json(uniqueEvents);
          }

          return res.status(403).json({ error: 'Unauthorized' });
        } catch (error) {
          console.error('Error retrieving events:', error);
          return res.status(500).json({ error: 'Failed to retrieve events' });
        }

      case 'assignments':
        try {
          // If event ID is provided
          if (id) {
            // Check if event exists
            const { data: event, error: eventError } = await supabase
              .from('events')
              .select('*')
              .eq('id', id)
              .single();

            if (eventError && eventError.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
              throw eventError;
            }

            if (!event) {
              return res.status(404).json({ error: 'Event not found' });
            }

            // If admin or event admin, return all assignments for the event
            if (role === 'admin' || event.adminId === userId) {
              const { data: assignments, error: assignmentsError } = await supabase
                .from('assignments')
                .select('*')
                .eq('eventId', id);

              if (assignmentsError) throw assignmentsError;

              return res.status(200).json(assignments);
            } 
            // Otherwise return only the user's assignment
            else if (userId) {
              const { data: assignment, error: assignmentError } = await supabase
                .from('assignments')
                .select('*')
                .eq('eventId', id)
                .eq('giverId', userId)
                .single();

              if (assignmentError && assignmentError.code !== 'PGRST116') {
                throw assignmentError;
              }

              return res.status(200).json(assignment || null);
            }
          }

          return res.status(400).json({ error: 'Event ID is required' });
        } catch (error) {
          console.error('Error retrieving assignments:', error);
          return res.status(500).json({ error: 'Failed to retrieve assignments' });
        }

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
      case 'signup':
        try {
          // Anyone can create a user (sign up)
          if (!payload.username || !payload.password) {
            return res.status(400).json({ error: 'Username and password are required' });
          }

          // Check if username already exists
          const { data: existingUsers, error: checkError } = await supabase
            .from('signup')
            .select('username')
            .eq('username', payload.username)
            .limit(1);

          if (checkError) throw checkError;

          if (existingUsers && existingUsers.length > 0) {
            return res.status(409).json({ error: 'Username already exists' });
          }

          // Create new user
          const newUser = {
            id: Date.now().toString(),
            username: payload.username,
            password: payload.password, // In a real app, this should be hashed
            role: payload.role || 'participant' // Default to participant role
          };

          const { data: createdUser, error: createError } = await supabase
            .from('signup')
            .insert([newUser])
            .select();

          if (createError) throw createError;

          // Don't return the password in the response
          const { password, ...userWithoutPassword } = createdUser[0];
          return res.status(201).json(userWithoutPassword);
        } catch (error) {
          console.error('Error creating user:', error);
          return res.status(500).json({ error: 'Failed to create user' });
        }

      case 'events':
        try {
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

          const { data: createdEvent, error: createError } = await supabase
            .from('events')
            .insert([newEvent])
            .select();

          if (createError) throw createError;

          return res.status(201).json(createdEvent[0]);
        } catch (error) {
          console.error('Error creating event:', error);
          return res.status(500).json({ error: 'Failed to create event' });
        }

      case 'assignments':
        try {
          // Only admin can generate assignments
          if (role !== 'admin') {
            // Check if user is the event admin
            const { data: eventData, error: eventError } = await supabase
              .from('events')
              .select('adminId')
              .eq('id', payload.eventId)
              .eq('adminId', userId)
              .limit(1);

            if (eventError) throw eventError;

            if (!eventData || eventData.length === 0) {
              return res.status(403).json({ error: 'Only the event admin can generate assignments' });
            }
          }

          if (!payload.eventId) {
            return res.status(400).json({ error: 'Event ID is required' });
          }

          // Get the event
          const { data: event, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', payload.eventId)
            .single();

          if (eventError) throw eventError;

          if (!event) {
            return res.status(404).json({ error: 'Event not found' });
          }

          // Check if there are enough participants
          if (!event.participants || event.participants.length < 3) {
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
          const { error: deleteError } = await supabase
            .from('assignments')
            .delete()
            .eq('eventId', payload.eventId);

          if (deleteError) throw deleteError;

          // Add new assignments
          const { data: createdAssignments, error: createError } = await supabase
            .from('assignments')
            .insert(newAssignments)
            .select();

          if (createError) throw createError;

          return res.status(201).json(createdAssignments);
        } catch (error) {
          console.error('Error creating assignments:', error);
          return res.status(500).json({ error: 'Failed to create assignments' });
        }

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
      case 'signup':
        try {
          // Users can only update their own data, admins can update any user
          const { data: userToUpdate, error: findError } = await supabase
            .from('signup')
            .select('*')
            .eq('id', id)
            .single();

          if (findError) throw findError;

          if (!userToUpdate) {
            return res.status(404).json({ error: 'User not found' });
          }

          if (role !== 'admin' && userId !== id) {
            return res.status(403).json({ error: 'Unauthorized' });
          }

          // Update user data
          const { data: updatedUser, error: updateError } = await supabase
            .from('signup')
            .update(payload)
            .eq('id', id)
            .select();

          if (updateError) throw updateError;

          // Don't return the password in the response
          const { password, ...userWithoutPassword } = updatedUser[0];
          return res.status(200).json(userWithoutPassword);
        } catch (error) {
          console.error('Error updating user:', error);
          return res.status(500).json({ error: 'Failed to update user' });
        }

      case 'events':
        try {
          // Only the event admin can update the event
          const { data: eventToUpdate, error: findError } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

          if (findError) throw findError;

          if (!eventToUpdate) {
            return res.status(404).json({ error: 'Event not found' });
          }

          if (role !== 'admin' && eventToUpdate.adminId !== userId) {
            return res.status(403).json({ error: 'Only the event admin can update the event' });
          }

          // Update event data
          const { data: updatedEvent, error: updateError } = await supabase
            .from('events')
            .update(payload)
            .eq('id', id)
            .select();

          if (updateError) throw updateError;

          return res.status(200).json(updatedEvent[0]);
        } catch (error) {
          console.error('Error updating event:', error);
          return res.status(500).json({ error: 'Failed to update event' });
        }

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
      case 'signup':
        try {
          // Only admins can delete users
          if (role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can delete users' });
          }

          // Check if user exists
          const { data: userToDelete, error: findError } = await supabase
            .from('signup')
            .select('*')
            .eq('id', id)
            .single();

          if (findError && findError.code !== 'PGRST116') throw findError;

          if (!userToDelete) {
            return res.status(404).json({ error: 'User not found' });
          }

          // Delete user
          const { error: deleteError } = await supabase
            .from('signup')
            .delete()
            .eq('id', id);

          if (deleteError) throw deleteError;

          return res.status(200).json({ 
            message: 'User deleted successfully', 
            user: { ...userToDelete, password: undefined } 
          });
        } catch (error) {
          console.error('Error deleting user:', error);
          return res.status(500).json({ error: 'Failed to delete user' });
        }

      case 'events':
        try {
          // Check if event exists and if user is authorized to delete it
          const { data: eventToDelete, error: findError } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

          if (findError && findError.code !== 'PGRST116') throw findError;

          if (!eventToDelete) {
            return res.status(404).json({ error: 'Event not found' });
          }

          // Only the event admin can delete the event
          if (role !== 'admin' && eventToDelete.adminId !== userId) {
            return res.status(403).json({ error: 'Only the event admin can delete the event' });
          }

          // Delete event's assignments first
          const { error: deleteAssignmentsError } = await supabase
            .from('assignments')
            .delete()
            .eq('eventId', id);

          if (deleteAssignmentsError) throw deleteAssignmentsError;

          // Delete the event
          const { error: deleteEventError } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

          if (deleteEventError) throw deleteEventError;

          return res.status(200).json({ 
            message: 'Event deleted successfully', 
            event: eventToDelete 
          });
        } catch (error) {
          console.error('Error deleting event:', error);
          return res.status(500).json({ error: 'Failed to delete event' });
        }

      default:
        return res.status(400).json({ error: 'Invalid type parameter' });
    }
  }
}
