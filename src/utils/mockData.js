// Mock data for events
export const mockEvents = [
  {
    id: 1,
    title: "Tech Conference 2024",
    description: "Join us for the biggest tech conference of the year featuring industry leaders and cutting-edge innovations.",
    date: "2024-07-15",
    time: "09:00",
    location: "San Francisco Convention Center",
    category: "Technology",
    organizer: "Tech Events Inc.",
    organizerId: 2,
    maxParticipants: 500,
    currentParticipants: 342,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    status: "upcoming",
    price: 299,
    tags: ["Technology", "Innovation", "Networking"]
  },
  {
    id: 2,
    title: "Digital Marketing Workshop",
    description: "Learn the latest digital marketing strategies and tools from industry experts.",
    date: "2024-06-20",
    time: "14:00",
    location: "Online Event",
    category: "Marketing",
    organizer: "Marketing Pro",
    organizerId: 2,
    maxParticipants: 100,
    currentParticipants: 87,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    status: "upcoming",
    price: 99,
    tags: ["Marketing", "Digital", "Workshop"]
  },
  {
    id: 3,
    title: "Startup Pitch Competition",
    description: "Watch innovative startups pitch their ideas to a panel of investors and industry experts.",
    date: "2024-06-25",
    time: "18:00",
    location: "Innovation Hub, New York",
    category: "Business",
    organizer: "Startup Network",
    organizerId: 2,
    maxParticipants: 200,
    currentParticipants: 156,
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop",
    status: "upcoming",
    price: 0,
    tags: ["Startup", "Investment", "Networking"]
  },
  {
    id: 4,
    title: "AI & Machine Learning Summit",
    description: "Explore the future of AI and machine learning with leading researchers and practitioners.",
    date: "2024-08-10",
    time: "10:00",
    location: "MIT Campus, Boston",
    category: "Technology",
    organizer: "AI Research Group",
    organizerId: 2,
    maxParticipants: 300,
    currentParticipants: 245,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop",
    status: "upcoming",
    price: 199,
    tags: ["AI", "Machine Learning", "Research"]
  },
  {
    id: 5,
    title: "Web Development Bootcamp",
    description: "Intensive 3-day bootcamp covering modern web development technologies and best practices.",
    date: "2024-05-15",
    time: "09:00",
    location: "Code Academy, Seattle",
    category: "Education",
    organizer: "Code Masters",
    organizerId: 2,
    maxParticipants: 50,
    currentParticipants: 50,
    image: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=400&fit=crop",
    status: "past",
    price: 599,
    tags: ["Web Development", "Bootcamp", "Programming"]
  },
  {
    id: 6,
    title: "Design Thinking Workshop",
    description: "Learn design thinking methodologies to solve complex problems and drive innovation.",
    date: "2024-05-20",
    time: "13:00",
    location: "Design Studio, Los Angeles",
    category: "Design",
    organizer: "Creative Minds",
    organizerId: 2,
    maxParticipants: 30,
    currentParticipants: 28,
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=400&fit=crop",
    status: "past",
    price: 149,
    tags: ["Design", "Innovation", "Workshop"]
  }
];

// Mock data for users
export const mockUsers = [
  { id: 1, email: 'admin@eventpro.com', password: 'admin123', name: 'Admin User', role: 'admin' },
  { id: 2, email: 'organizer@eventpro.com', password: 'organizer123', name: 'Event Organizer', role: 'organizer' },
  { id: 3, email: 'user@eventpro.com', password: 'user123', name: 'Regular User', role: 'subscriber' },
];

// Mock data for event registrations
export const mockRegistrations = [
  { userId: 3, eventId: 1, registeredAt: '2024-06-01' },
  { userId: 3, eventId: 2, registeredAt: '2024-06-02' },
  { userId: 3, eventId: 3, registeredAt: '2024-06-03' },
];

// Helper functions
export const getUpcomingEvents = () => {
  return mockEvents.filter(event => event.status === 'upcoming');
};

export const getPastEvents = () => {
  return mockEvents.filter(event => event.status === 'past');
};

export const getEventById = (id) => {
  return mockEvents.find(event => event.id === parseInt(id));
};

export const getUserRegistrations = (userId) => {
  const userRegistrations = mockRegistrations.filter(reg => reg.userId === userId);
  return userRegistrations.map(reg => ({
    ...getEventById(reg.eventId),
    registeredAt: reg.registeredAt
  }));
};

export const isUserRegistered = (userId, eventId) => {
  return mockRegistrations.some(reg => reg.userId === userId && reg.eventId === eventId);
};


export const getOrganizerEvents = (organizerId) => {
  return mockEvents.filter(event => event.organizerId === organizerId);
};

export const getEventParticipants = (eventId) => {
  // Mock participants data
  const participants = mockRegistrations
    .filter(reg => reg.eventId === eventId)
    .map(reg => {
      const user = mockUsers.find(u => u.id === reg.userId);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        registeredAt: reg.registeredAt
      };
    });
  return participants;
};

