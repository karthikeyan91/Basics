import Head from 'next/head';
import Link from 'next/link';
import { useContext, useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import { ThemeContext } from './_app';

export default function SecretSanta() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Authentication state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // UI state
  const [activeView, setActiveView] = useState('login'); // login, signup, admin, participant

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Admin state
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Participant state
  const [myEvents, setMyEvents] = useState([]);
  const [myAssignment, setMyAssignment] = useState(null);

  // Check for existing session on component mount
  useEffect(() => {
    const token = localStorage.getItem('secretSantaToken');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch events when user changes
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        fetchEvents();
        fetchAllUsers(); // Fetch all users for admin
      } else {
        fetchMyEvents();
      }
    }
  }, [user]);

  // Fetch participants when selected event changes
  useEffect(() => {
    if (selectedEvent && user?.role === 'admin') {
      fetchParticipants(selectedEvent.id);
    }
  }, [selectedEvent]);

  // Verify token
  const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/secret-santa/auth?action=verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setActiveView(data.user.role === 'admin' ? 'admin' : 'participant');
      } else {
        localStorage.removeItem('secretSantaToken');
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      localStorage.removeItem('secretSantaToken');
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);

    try {
      const response = await fetch('/api/secret-santa/auth?action=login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('secretSantaToken', data.token);
        setUser(data.user);
        setActiveView(data.user.role === 'admin' ? 'admin' : 'participant');
        setUsername('');
        setPassword('');
      } else {
        setAuthError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setAuthError('An error occurred during login');
    }
  };

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError(null);

    try {
      const response = await fetch('/api/secret-santa/auth?action=signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('secretSantaToken', data.token);
        setUser(data.user);
        setActiveView('participant');
        setUsername('');
        setPassword('');
      } else {
        setAuthError(data.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setAuthError('An error occurred during signup');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/secret-santa/auth?action=logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      localStorage.removeItem('secretSantaToken');
      setUser(null);
      setActiveView('login');
      setEvents([]);
      setSelectedEvent(null);
      setParticipants([]);
      setMyEvents([]);
      setMyAssignment(null);
    }
  };

  // Fetch all events (admin only)
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('secretSantaToken');
      const response = await fetch(`/api/secret-santa/data?type=events&userId=${user.id}&role=${user.role}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Fetch events for the current participant
  const fetchMyEvents = async () => {
    try {
      const token = localStorage.getItem('secretSantaToken');
      const response = await fetch(`/api/secret-santa/data?type=events&userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMyEvents(data);
      }
    } catch (error) {
      console.error('Error fetching my events:', error);
    }
  };

  // Fetch all users (admin only)
  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('secretSantaToken');
      const response = await fetch(`/api/secret-santa/data?type=users&role=${user.role}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const users = await response.json();
        // Filter to only include participants (not admins)
        const participantUsers = users.filter(u => u.role === 'participant');
        setAllUsers(participantUsers);
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  };

  // Fetch participants for an event (admin only)
  const fetchParticipants = async (eventId) => {
    try {
      const token = localStorage.getItem('secretSantaToken');
      const response = await fetch(`/api/secret-santa/data?type=users&role=${user.role}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const allUsers = await response.json();
        // Filter users to only include participants in the selected event
        const eventParticipants = allUsers.filter(u => 
          selectedEvent.participants.includes(u.id)
        );
        setParticipants(eventParticipants);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  // Remove a participant from an event (admin only)
  const handleRemoveParticipant = async (participantId) => {
    if (!selectedEvent) {
      return;
    }

    try {
      const token = localStorage.getItem('secretSantaToken');

      // Create updated event without the participant
      const updatedEvent = {
        ...selectedEvent,
        participants: selectedEvent.participants.filter(id => id !== participantId)
      };

      const response = await fetch(`/api/secret-santa/data?type=events&id=${selectedEvent.id}&userId=${user.id}&role=${user.role}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedEvent),
      });

      if (response.ok) {
        const updatedEventData = await response.json();

        // Update the events list
        setEvents(events.map(e => e.id === updatedEventData.id ? updatedEventData : e));

        // Update the selected event
        setSelectedEvent(updatedEventData);

        // Update the participants list
        setParticipants(participants.filter(p => p.id !== participantId));
      }
    } catch (error) {
      console.error('Error removing participant:', error);
    }
  };

  // Create a new event (admin only)
  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!newEventName) {
      return;
    }

    try {
      const token = localStorage.getItem('secretSantaToken');
      const response = await fetch(`/api/secret-santa/data?type=events&userId=${user.id}&role=${user.role}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newEventName,
          description: newEventDescription,
          participants: []
        }),
      });

      if (response.ok) {
        const newEvent = await response.json();
        setEvents([...events, newEvent]);
        setNewEventName('');
        setNewEventDescription('');
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  // Add participants to an event (admin only)
  const handleAddParticipant = async (e) => {
    e.preventDefault();

    if (selectedUserIds.length === 0 || !selectedEvent) {
      return;
    }

    try {
      const token = localStorage.getItem('secretSantaToken');

      // Filter out users who are already participants
      const newUserIds = selectedUserIds.filter(id => !selectedEvent.participants.includes(id));

      if (newUserIds.length === 0) {
        alert('All selected users are already participants in this event.');
        return;
      }

      // Find the selected users from allUsers
      const selectedUsers = allUsers.filter(u => newUserIds.includes(u.id));
      if (selectedUsers.length === 0) {
        alert('No valid users selected.');
        return;
      }

      // Add the users to the event
      const updatedEvent = {
        ...selectedEvent,
        participants: [...selectedEvent.participants, ...newUserIds]
      };

      const eventResponse = await fetch(`/api/secret-santa/data?type=events&id=${selectedEvent.id}&userId=${user.id}&role=${user.role}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedEvent),
      });

      if (eventResponse.ok) {
        const updatedEventData = await eventResponse.json();

        // Update the events list
        setEvents(events.map(e => e.id === updatedEventData.id ? updatedEventData : e));

        // Update the selected event
        setSelectedEvent(updatedEventData);

        // Add the selected users to the participants list
        setParticipants([...participants, ...selectedUsers]);

        // Reset the selected users
        setSelectedUserIds([]);
      }
    } catch (error) {
      console.error('Error adding participant:', error);
    }
  };

  // Generate assignments for an event (admin only)
  const handleGenerateAssignments = async () => {
    if (!selectedEvent) {
      return;
    }

    try {
      const token = localStorage.getItem('secretSantaToken');
      const response = await fetch(`/api/secret-santa/data?type=assignments&userId=${user.id}&role=${user.role}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: selectedEvent.id
        }),
      });

      if (response.ok) {
        alert('Assignments generated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error generating assignments:', error);
      alert('An error occurred while generating assignments');
    }
  };

  // Delete an event (admin only)
  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('secretSantaToken');
      const response = await fetch(`/api/secret-santa/data?type=events&id=${eventId}&userId=${user.id}&role=${user.role}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove the event from the events list
        setEvents(events.filter(e => e.id !== eventId));

        // If the deleted event was selected, clear the selection
        if (selectedEvent && selectedEvent.id === eventId) {
          setSelectedEvent(null);
          setParticipants([]);
        }

        alert('Event deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('An error occurred while deleting the event');
    }
  };

  // Fetch my assignment for an event (participant only)
  const fetchMyAssignment = async (eventId) => {
    try {
      const token = localStorage.getItem('secretSantaToken');
      const response = await fetch(`/api/secret-santa/data?type=assignments&id=${eventId}&userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const assignment = await response.json();

        if (assignment) {
          // Fetch the receiver's details
          const receiverResponse = await fetch(`/api/secret-santa/data?type=users&id=${assignment.receiverId}&userId=${user.id}&role=${user.role}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (receiverResponse.ok) {
            const receiver = await receiverResponse.json();
            setMyAssignment({
              ...assignment,
              receiver
            });
          }
        } else {
          setMyAssignment(null);
        }
      }
    } catch (error) {
      console.error('Error fetching my assignment:', error);
    }
  };

  // Render login form
  const renderLoginForm = () => (
    <div className={styles.feedContainer} style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2 className={styles.feedTitle}>Login</h2>

      {authError && (
        <div className={styles.error}>
          {authError}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className={styles.input}
            style={{ borderRadius: '8px', width: '100%' }}
            required
          />
        </div>

        <div className={styles.inputGroup} style={{ marginBottom: '1.5rem' }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={styles.input}
            style={{ borderRadius: '8px', width: '100%' }}
            required
          />
        </div>

        <button
          type="submit"
          className={styles.button}
          style={{ width: '100%', marginBottom: '1rem', borderRadius: '8px' }}
        >
          Login
        </button>
      </form>

      <p style={{ textAlign: 'center' }}>
        Don't have an account?{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('signup');
            setAuthError(null);
          }}
          style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}
        >
          Sign up
        </a>
      </p>
    </div>
  );

  // Render signup form
  const renderSignupForm = () => (
    <div className={styles.feedContainer} style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2 className={styles.feedTitle}>Sign Up</h2>

      {authError && (
        <div className={styles.error}>
          {authError}
        </div>
      )}

      <form onSubmit={handleSignup}>
        <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className={styles.input}
            style={{ borderRadius: '8px', width: '100%' }}
            required
          />
        </div>

        <div className={styles.inputGroup} style={{ marginBottom: '1.5rem' }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={styles.input}
            style={{ borderRadius: '8px', width: '100%' }}
            required
          />
        </div>

        <button
          type="submit"
          className={styles.button}
          style={{ width: '100%', marginBottom: '1rem', borderRadius: '8px' }}
        >
          Sign Up
        </button>
      </form>

      <p style={{ textAlign: 'center' }}>
        Already have an account?{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('login');
            setAuthError(null);
          }}
          style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}
        >
          Login
        </a>
      </p>
    </div>
  );

  // Render admin view
  const renderAdminView = () => (
    <div className={styles.feedsRow}>
      {/* Events List */}
      <div className={styles.feedContainer}>
        <h2 className={styles.feedTitle}>Events</h2>

        {events.length === 0 ? (
          <p>No events found. Create your first event!</p>
        ) : (
          <ul className={styles.feedList}>
            {events.map((event) => (
              <li
                key={event.id}
                className={`${styles.feedItem} ${selectedEvent?.id === event.id ? styles.activeItem : ''}`}
                onClick={() => setSelectedEvent(event)}
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                <button
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete the event "${event.name}"?`)) {
                      handleDeleteEvent(event.id);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(255, 0, 0, 0.1)',
                    color: '#ff6b6b',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                  title="Delete event"
                >
                  ✕
                </button>
                <h3>{event.name}</h3>
                {event.description && <p>{event.description}</p>}
                <p>Participants: {event.participants.length}</p>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleCreateEvent} style={{ marginTop: '1.5rem' }}>
          <h3>Create New Event</h3>
          <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              placeholder="Event Name"
              className={styles.input}
              style={{ borderRadius: '8px', width: '100%' }}
              required
            />
          </div>

          <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={newEventDescription}
              onChange={(e) => setNewEventDescription(e.target.value)}
              placeholder="Event Description (optional)"
              className={styles.input}
              style={{ borderRadius: '8px', width: '100%' }}
            />
          </div>

          <button
            type="submit"
            className={styles.button}
            style={{ width: '100%', borderRadius: '8px' }}
          >
            Create Event
          </button>
        </form>
      </div>

      {/* Participants List */}
      {selectedEvent && (
        <div className={styles.feedContainer}>
          <h2 className={styles.feedTitle}>Participants for {selectedEvent.name}</h2>

          {participants.length === 0 ? (
            <p>No participants yet. Add some participants!</p>
          ) : (
            <ul className={styles.feedList}>
              {participants.map((participant) => (
                <li key={participant.id} className={styles.feedItem} style={{ position: 'relative' }}>
                  <button
                    className={styles.deleteButton}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to remove ${participant.username} from this event?`)) {
                        handleRemoveParticipant(participant.id);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(255, 0, 0, 0.1)',
                      color: '#ff6b6b',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                    title="Remove participant"
                  >
                    ✕
                  </button>
                  <h3>{participant.username}</h3>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAddParticipant} style={{ marginTop: '1.5rem' }}>
            <h3>Add Participant from Existing Users</h3>
            <div className={styles.checkboxGrid}>
              {allUsers
                .filter(u => !selectedEvent.participants.includes(u.id)) // Filter out users already in the event
                .map(user => (
                  <div key={user.id} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      id={`user-${user.id}`}
                      value={user.id}
                      checked={selectedUserIds.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUserIds([...selectedUserIds, user.id]);
                        } else {
                          setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                        }
                      }}
                    />
                    <label htmlFor={`user-${user.id}`}>{user.username}</label>
                  </div>
                ))
              }
            </div>

            <button
              type="submit"
              className={styles.button}
              style={{ width: '100%', marginBottom: '1rem', borderRadius: '8px' }}
              disabled={selectedUserIds.length === 0}
            >
              Add Selected Participants
            </button>

            <button
              type="button"
              onClick={handleGenerateAssignments}
              className={styles.button}
              style={{ width: '100%', borderRadius: '8px' }}
              disabled={participants.length < 3}
            >
              Generate Assignments
            </button>

            {participants.length < 3 && (
              <p style={{ color: 'var(--accent-color)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                You need at least 3 participants to generate assignments.
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );

  // Render participant view
  const renderParticipantView = () => (
    <div className={styles.feedsRow}>
      {/* My Events */}
      <div className={styles.feedContainer}>
        <h2 className={styles.feedTitle}>My Secret Santa Events</h2>

        {myEvents.length === 0 ? (
          <p>You are not part of any Secret Santa events yet.</p>
        ) : (
          <ul className={styles.feedList}>
            {myEvents.map((event) => (
              <li
                key={event.id}
                className={styles.feedItem}
                onClick={() => fetchMyAssignment(event.id)}
                style={{ cursor: 'pointer' }}
              >
                <h3>{event.name}</h3>
                {event.description && <p>{event.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* My Assignment */}
      {myAssignment && (
        <div className={styles.feedContainer}>
          <h2 className={styles.feedTitle}>My Secret Santa Assignment</h2>

          <div className={styles.assignmentCard}>
            <p>You are the Secret Santa for:</p>
            <h3 style={{ color: 'var(--accent-color)', fontSize: '1.5rem', margin: '1rem 0' }}>
              {myAssignment.receiver.username}
            </h3>
            <p>Remember to keep it a secret! 🤫</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <Link href="/">Basics</Link>
          </div>
          <div className={styles.navigation}>
            <Link href="/" className={styles.navLink}>
              News
            </Link>
            <Link href="/price-comparison" className={styles.navLink}>
              Price Comparison
            </Link>
            <Link href="/budget-tracker" className={styles.navLink}>
              Budget Tracker
            </Link>
            <Link href="/secret-santa" className={styles.navLink}>
              Secret Santa
            </Link>
          </div>
          <div className={styles.themeToggle}>
            <button 
              className={styles.themeButton}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={`Current theme: ${theme}. Click to change.`}
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <Head>
          <title> Secret Swap - Basics</title>
          <meta name="description" content="Organize your Secret Santa gift exchange" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <h1 className={styles.title}>Secret Swap</h1>

          {user && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1000px', marginBottom: '2rem' }}>
              <p className={styles.description}>
                Welcome, <strong>{user.username}</strong> ({user.role})
              </p>

              <button
                onClick={handleLogout}
                className={styles.button}
                style={{ borderRadius: '8px' }}
              >
                Logout
              </button>
            </div>
          )}

          {!user && (
            <p className={styles.description}>
              Sign in or create an account to organize your Secret Santa gift exchange.
            </p>
          )}

          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            <>
              {!user && activeView === 'login' && renderLoginForm()}
              {!user && activeView === 'signup' && renderSignupForm()}
              {user && user.role === 'admin' && renderAdminView()}
              {user && user.role === 'participant' && renderParticipantView()}
            </>
          )}
        </main>
      </div>

      <footer className={styles.footer}>
        <p><small>Copyright 2025</small></p>
      </footer>
    </>
  );
}
