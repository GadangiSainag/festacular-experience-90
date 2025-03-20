
/**
 * Seed Data for NextFest
 * 
 * Use this script to populate your database with sample data.
 * Run this function with a console.log to get the SQL statements,
 * or adapt it to your needs.
 */

export const generateSeedData = (adminId: string) => {
  // Example admin ID: Replace with the actual admin user ID from your database
  const admin_id = adminId || "d457d214-afc8-456f-a4c7-2089c3269ec7";

  const getRandomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Generate events
  const eventCategories = [
    'competition', 'workshop', 'stall', 'exhibit', 'performance', 
    'lecture', 'games', 'food', 'merch', 'art', 'sport'
  ];

  const venues = [
    'Main Auditorium', 'Sports Complex', 'Lecture Hall A', 'Engineering Block', 
    'Science Block', 'Open Air Theatre', 'Student Center', 'Library Lawn',
    'Cafeteria', 'Arts Building', 'Computer Lab'
  ];

  const departments = [
    'Computer Science', 'Electrical Engineering', 'Mechanical Engineering',
    'Civil Engineering', 'Physics', 'Chemistry', 'Mathematics', 'Arts',
    'Business Administration', 'Biology', 'Architecture'
  ];

  const colleges = [
    'College of Engineering', 'College of Sciences', 'College of Liberal Arts',
    'School of Management', 'Faculty of Arts and Design'
  ];

  const eventNames = [
    'Hackathon 2025', 'Coding Challenge', 'Robotics Workshop',
    'Dance Competition', 'Music Night', 'Technical Quiz',
    'Research Symposium', 'Alumni Meet', 'Cultural Fest',
    'Sports Day', 'Photography Exhibition', 'Debate Competition',
    'Food Festival', 'Art and Craft Fair', 'Career Fair',
    'Guest Lecture Series', 'Film Screening', 'Gaming Tournament',
    'Fashion Show', 'Poetry Slam'
  ];

  const now = new Date();
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  // Generate 20 events
  const events = [];
  for (let i = 0; i < 20; i++) {
    const eventDate = getRandomDate(now, oneMonthFromNow);
    const category = eventCategories[Math.floor(Math.random() * eventCategories.length)];
    const venue = venues[Math.floor(Math.random() * venues.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    const college = colleges[Math.floor(Math.random() * colleges.length)];
    const name = eventNames[i % eventNames.length];
    
    events.push({
      name,
      category,
      date: formatDate(eventDate),
      time: formatTime(eventDate),
      venue,
      department,
      college,
      description: `This is a sample description for the ${name} event. It will be held on ${formatDate(eventDate)} at ${venue}. All ${department} students are welcome to participate!`,
      organizer_id: admin_id,
      is_approved: true
    });
  }

  // Generate festival updates
  const updateMessages = [
    'Welcome to NextFest 2025! Get ready for an amazing experience.',
    'The registration for all competitions is now open. Register before the deadline!',
    'Special announcement: Celebrity performance on Day 2. Don\'t miss it!',
    'Due to popular demand, we have extended the registration deadline for Hackathon.',
    'Food stalls will be open from 10 AM to 10 PM every day during the fest.'
  ];

  const festivalUpdates = updateMessages.map(message => ({
    message,
    admin_id
  }));

  // Generate SQL for events
  const eventsSQL = events.map(event => `
INSERT INTO events (name, category, date, time, venue, department, college, description, organizer_id, is_approved)
VALUES (
  '${event.name}',
  '${event.category}',
  '${event.date}',
  '${event.time}',
  '${event.venue}',
  '${event.department}',
  '${event.college}',
  '${event.description}',
  '${event.organizer_id}',
  ${event.is_approved}
);`).join('\n');

  // Generate SQL for festival updates
  const updatesSQL = festivalUpdates.map(update => `
INSERT INTO festival_updates (message, admin_id)
VALUES (
  '${update.message}',
  '${update.admin_id}'
);`).join('\n');

  return {
    eventsSQL,
    updatesSQL,
    fullSQL: `-- Events\n${eventsSQL}\n\n-- Festival Updates\n${updatesSQL}`
  };
};

// Example usage:
// const adminId = "your-admin-user-id"; // Replace with your admin user ID
// const seedData = generateSeedData(adminId);
// console.log(seedData.fullSQL);
