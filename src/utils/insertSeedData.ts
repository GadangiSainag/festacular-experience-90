
import { supabase } from "@/integrations/supabase/client";

/**
 * Inserts seed data directly into the database
 * @param adminId The ID of the admin user who will own the created events
 */
export const insertSeedData = async (adminId: string) => {
  if (!adminId) {
    console.error("Admin ID is required to insert seed data");
    return;
  }

  console.log("Starting seed data insertion...");
  const now = new Date();
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  const getRandomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Event data
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

  // Generate events
  const events = [];
  for (let i = 0; i < 20; i++) {
    const eventDate = getRandomDate(now, oneMonthFromNow);
    const category = eventCategories[Math.floor(Math.random() * eventCategories.length)] as any;
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
      organizer_id: adminId,
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
    admin_id: adminId
  }));

  // Insert events
  try {
    console.log("Inserting events...");
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .insert(events)
      .select();
    
    if (eventsError) throw eventsError;
    console.log("Events inserted successfully:", eventsData.length);
    
    // Insert festival updates
    console.log("Inserting festival updates...");
    const { data: updatesData, error: updatesError } = await supabase
      .from('festival_updates')
      .insert(festivalUpdates)
      .select();
    
    if (updatesError) throw updatesError;
    console.log("Festival updates inserted successfully:", updatesData.length);
    
    return {
      success: true,
      eventsInserted: eventsData.length,
      updatesInserted: updatesData.length
    };
  } catch (error) {
    console.error("Error inserting seed data:", error);
    return {
      success: false,
      error
    };
  }
};

// Usage example:
// Call this function from the browser console:
// import { insertSeedData } from "@/utils/insertSeedData"; 
// insertSeedData("your-admin-user-id");
