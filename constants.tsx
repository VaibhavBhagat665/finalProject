
import React from 'react';
import { UserRole, MoodRating, type Student, type Nudge, type FlaggedStudentSummary, type FacultyNote, type Plan, PlanFeature } from './types';

// Icons (simple SVG components) - Adjusted for potential dark theme, default color will be `currentColor`
export const AcademicCapIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path d="M12 2L1 7.5l11 5.5 11-5.5L12 2zm0 17.5v-10M3.5 9v6l8.5 4.25V13M20.5 9v6l-8.5 4.25V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

export const ChecklistIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const MoodHappyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" fill="none" stroke="currentColor"></path>
  </svg>
);

export const MoodSadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" fill="none" stroke="currentColor"></path>
  </svg>
);

export const MoodNeutralIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14h6M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" fill="none" stroke="currentColor"></path>
  </svg>
);

export const BrainIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "w-6 h-6"}><path d="M12 2a4.5 4.5 0 0 0-4.5 4.5C7.5 8.63 9.25 10 12 10s4.5-1.37 4.5-3.5A4.5 4.5 0 0 0 12 2Z"/><path d="M12 10v0c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6Z"/><path d="M15.57 12.43c.84-.3 1.5-.99 1.5-1.93a2.5 2.5 0 0 0-2.5-2.5c-.99 0-1.79.68-2.23 1.57"/><path d="M12 10v0c-1.38 0-2.5 1.12-2.5 2.5S10.62 15 12 15s2.5-1.12 2.5-2.5"/><path d="M8.43 12.43c-.84-.3-1.5-.99-1.5-1.93a2.5 2.5 0 0 1 2.5-2.5c.99 0 1.79.68 2.23 1.57"/></svg>
);

export const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "w-6 h-6"}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

export const MessageSquareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "w-6 h-6"}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

export const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "w-5 h-5"}><path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.7 10.2 18 9 18 8A6 6 0 0 0 6 8c0 1 .3 2.2 1.5 3.5.7.7 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
);

export const DumbbellIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "w-5 h-5"}><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 5.343a2.828 2.828 0 1 0-4-4l-1.626 1.626a2.828 2.828 0 0 0 0 4L14.4 8.314a2.828 2.828 0 0 0 4 0z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M5.343 18.657a2.828 2.828 0 1 0-4-4l-1.626 1.626a2.828 2.828 0 0 0 0 4L1.086 21.7a2.828 2.828 0 0 0 4 0z"/><path d="m12.7 12.7 1.4 1.4"/><path d="M6.5 6.5 8 8"/></svg>
);

export const CoffeeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "w-5 h-5"}><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2"/><path d="M10 2v2"/><path d="M14 2v2"/></svg>
);

export const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "w-6 h-6"}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "w-6 h-6"}><path d="M12 3v2.55c.7.15 1.3.44 1.81.84l1.8-1.8.7.7-1.8 1.8c.4.51.7 1.11.84 1.81H18v1h-2.55c-.15.7-.44 1.3-.84 1.81l1.8 1.8-.7.7-1.8-1.8c-.51.4-1.11.7-1.81.84V18h-1v-2.55c-.7-.15-1.3-.44-1.81-.84l-1.8 1.8-.7-.7 1.8-1.8c-.4-.51-.7-1.11-.84-1.81H6v-1h2.55c.15-.7.44-1.3.84-1.81l-1.8-1.8.7-.7 1.8 1.8c.51-.4 1.11-.7 1.81-.84V3h1Z"/></svg>
);

export const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M2.25 12v8.25a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75v-5.25h-3V21a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75V12m0 0A8.961 8.961 0 0112 6.202a8.961 8.961 0 017.75 5.798" />
  </svg>
);

export const DollarSignIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const LogInIcon: React.FC<{ className?: string }> = ({ className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
</svg>
);

export const LogOutIcon: React.FC<{ className?: string }> = ({ className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M15.75 15l3-3m0 0l-3-3m3 3H9" />
</svg>
);

export const BuildingOfficeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.375a.375.375 0 01.375.375v1.5a.375.375 0 01-.375.375H9a.375.375 0 01-.375-.375v-1.5A.375.375 0 019 6.75zM9 12.75h6.375a.375.375 0 01.375.375v1.5a.375.375 0 01-.375.375H9a.375.375 0 01-.375-.375v-1.5a.375.375 0 01.375-.375z" />
  </svg>
);


export const MOCK_STUDENT_DATA: Student = {
  id: 'student123',
  name: 'Alex Doe',
  avatarUrl: 'https://picsum.photos/seed/student123/100/100',
  wellnessPoints: 1250,
  gpaHistory: [
    { semester: 'Fall 2022', gpa: 3.5 },
    { semester: 'Spring 2023', gpa: 3.2 },
    { semester: 'Fall 2023', gpa: 2.8 },
    { semester: 'Spring 2024', gpa: 3.0 },
  ],
  assignments: [
    { id: 'a1', name: 'Calculus HW 1', dueDate: '2024-03-01', submittedDate: '2024-03-01', status: 'Submitted' },
    { id: 'a2', name: 'History Essay', dueDate: '2024-03-05', submittedDate: '2024-03-07', status: 'Late' },
    { id: 'a3', name: 'Physics Lab Report', dueDate: '2024-03-10', status: 'Missed' },
    { id: 'a4', name: 'Calculus HW 2', dueDate: '2024-03-15', submittedDate: '2024-03-14', status: 'Submitted' },
    { id: 'a5', name: 'Literature Review', dueDate: '2024-04-01', status: 'Pending' },
  ],
  moodEntries: [
    { id: 'm1', date: new Date(2024, 2, 1).toISOString(), rating: MoodRating.HAPPY, journal: 'Felt good after finishing calculus hw.' },
    { id: 'm2', date: new Date(2024, 2, 5).toISOString(), rating: MoodRating.NEUTRAL, journal: 'Stressed about the history essay.' },
    { id: 'm3', date: new Date(2024, 2, 10).toISOString(), rating: MoodRating.SAD, journal: 'Missed the physics lab, feeling down.' },
    { id: 'm4', date: new Date(2024, 2, 15).toISOString(), rating: MoodRating.HAPPY, journal: 'Did well on the next HW.' },
    { id: 'm5', date: new Date(2024, 3, 1).toISOString(), rating: MoodRating.NEUTRAL },
  ],
  riskScore: 65, // Example risk score
  riskFactors: [
    'Noticeable drop in GPA in Fall 2023.',
    'Pattern of late/missed assignments (History Essay, Physics Lab).',
    'Self-reported sad mood on 2024-03-10.',
  ],
};

export const MOCK_STUDENT_DATA_LOW_RISK: Student = {
  id: 'student456',
  name: 'Jamie Lee',
  avatarUrl: 'https://picsum.photos/seed/student456/100/100',
  wellnessPoints: 2500,
  gpaHistory: [
    { semester: 'Fall 2022', gpa: 3.8 },
    { semester: 'Spring 2023', gpa: 3.9 },
    { semester: 'Fall 2023', gpa: 3.7 },
    { semester: 'Spring 2024', gpa: 3.8 },
  ],
  assignments: [
    { id: 'b1', name: 'Biology Report', dueDate: '2024-03-01', submittedDate: '2024-03-01', status: 'Submitted' },
    { id: 'b2', name: 'Chemistry Presentation', dueDate: '2024-03-15', submittedDate: '2024-03-14', status: 'Submitted' },
  ],
  moodEntries: [
    { id: 'n1', date: new Date(2024, 3, 1).toISOString(), rating: MoodRating.VERY_HAPPY, journal: 'Feeling great this month!' },
  ],
  riskScore: 15,
  riskFactors: ['Consistently high academic performance.', 'Positive mood entries.'],
};


export const MOCK_NUDGES: Nudge[] = [
  { id: 'n1', title: 'Study Tip: Pomodoro Technique', content: 'Try studying in 25-minute focused intervals with 5-minute breaks. It can boost concentration!', type: 'study', icon: <LightbulbIcon className="w-5 h-5 text-yellow-400" /> },
  { id: 'n2', title: 'Mindfulness Moment: Box Breathing', content: 'Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. Repeat for a few minutes to calm your mind.', type: 'mindfulness', icon: <BrainIcon className="w-5 h-5 text-sky-400" /> },
  { id: 'n3', title: 'Quick Activity: Stretch Break', content: 'Stand up and stretch for 5 minutes. It helps with focus and energy levels.', type: 'activity', icon: <DumbbellIcon className="w-5 h-5 text-green-400" /> },
  { id: 'n4', title: 'Campus Resource: Counseling Center', content: 'Remember, the university counseling center offers free and confidential support. Room 302, Student Union.', type: 'resource', icon: <UsersIcon className="w-5 h-5 text-purple-400" /> },
];

export const MOCK_FACULTY_FLAGGED_STUDENTS: FlaggedStudentSummary[] = [
  { studentId: 'student123_anon', pseudonym: 'Student Alpha', riskScore: 65, primaryConcern: 'Declining GPA & Missed Work', lastMood: MoodRating.SAD },
  { studentId: 'student789_anon', pseudonym: 'Student Beta', riskScore: 80, primaryConcern: 'High assignment irregularity', lastMood: MoodRating.NEUTRAL },
  { studentId: 'student001_anon', pseudonym: 'Student Gamma', riskScore: 55, primaryConcern: 'Slight dip in performance', lastMood: MoodRating.HAPPY },
];

export const MOCK_FACULTY_NOTES: { [studentId: string]: FacultyNote[] } = {
  student123_anon: [
    { id: 'fn1', timestamp: new Date(2024, 3, 2).toISOString(), text: 'Reached out via email to check in. Offered resources.', author: 'Dr. Smith' },
    { id: 'fn2', timestamp: new Date(2024, 3, 5).toISOString(), text: 'Student scheduled a meeting for next week.', author: 'Dr. Smith' },
  ],
  student789_anon: [
     { id: 'fn3', timestamp: new Date(2024, 3, 3).toISOString(), text: 'Discussed time management strategies during office hours.', author: 'Prof. Jones' },
  ]
};

export const MOOD_OPTIONS = [
  { rating: MoodRating.VERY_SAD, label: 'Very Sad', Icon: (props: {className?: string}) => <MoodSadIcon {...props} />, colorClass: 'text-red-400', fillClass: 'fill-red-500' },
  { rating: MoodRating.SAD, label: 'Sad', Icon: (props: {className?: string}) => <MoodSadIcon {...props} />, colorClass: 'text-orange-400', fillClass: 'fill-orange-500' },
  { rating: MoodRating.NEUTRAL, label: 'Neutral', Icon: (props: {className?: string}) => <MoodNeutralIcon {...props} />, colorClass: 'text-yellow-400', fillClass: 'fill-yellow-500' },
  { rating: MoodRating.HAPPY, label: 'Happy', Icon: (props: {className?: string}) => <MoodHappyIcon {...props} />, colorClass: 'text-green-400', fillClass: 'fill-green-500' },
  { rating: MoodRating.VERY_HAPPY, label: 'Very Happy', Icon: (props: {className?: string}) => <MoodHappyIcon {...props} />, colorClass: 'text-sky-400', fillClass: 'fill-sky-500' },
];

export const CHATBOT_SUGGESTIONS = [
  "I'm feeling overwhelmed.",
  "Tell me a breathing exercise.",
  "Help me with study tips.",
  "I need to talk to someone.",
];

export const APP_NAME = "MindSetu";
export const APP_SLOGAN = "Bridge to your mental wellness";
export const CHATBOT_NAME = "SetuAI";

export const DEFAULT_USER_ROLE = UserRole.STUDENT; // Default for general navigation, auth will set specific role

export const GEMINI_CHAT_MODEL = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_SYSTEM_INSTRUCTION = `You are ${CHATBOT_NAME}, a friendly and supportive AI assistant for students using the ${APP_NAME} platform. Your goal is to provide helpful advice, mindfulness exercises, scheduling assistance, and a listening ear. 
If a student expresses severe distress, persistent low mood, or mentions thoughts of self-harm or harming others, gently and empathetically encourage them to seek help immediately from a trusted adult, counselor, campus mental health services, or a crisis hotline. Provide a generic crisis hotline number if appropriate for a US context (e.g., "You can call or text 988 in the US"). 
Do not provide medical diagnoses or therapy. Keep responses concise, empathetic, and actionable. 
If asked about your capabilities, mention you can help with stress management, study tips, and provide a safe space to talk.
If asked about privacy, state: "I'm designed to be a confidential space for you. Your conversations are private."
Current Date: ${new Date().toLocaleDateString()}`;

// --- Pricing Plans ---
export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    pricePerStudentPerMonth: 1,
    description: 'Essential tools for individual student wellness and basic monitoring.',
    features: [
      PlanFeature.BASIC_ANALYTICS,
      PlanFeature.MOOD_TRACKING,
      PlanFeature.WELLNESS_POINTS,
      PlanFeature.BASIC_NUDGES,
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    pricePerStudentPerMonth: 2.5,
    description: 'Comprehensive features for students and faculty, including AI support.',
    features: [
      PlanFeature.BASIC_ANALYTICS,
      PlanFeature.MOOD_TRACKING,
      PlanFeature.MOOD_TIMELINE,
      PlanFeature.WELLNESS_POINTS,
      PlanFeature.BASIC_NUDGES,
      PlanFeature.SETU_AI_CHATBOT,
      PlanFeature.FACULTY_DASHBOARD, // Basic version
      PlanFeature.ADMIN_PANEL, // Basic version for user management
    ],
    highlight: true,
  },
  {
    id: 'advanced',
    name: 'Advanced',
    pricePerStudentPerMonth: 4,
    description: 'Full suite for institutions needing deep insights, customization, and support.',
    features: [
      PlanFeature.BASIC_ANALYTICS,
      PlanFeature.MOOD_TRACKING,
      PlanFeature.MOOD_TIMELINE,
      PlanFeature.WELLNESS_POINTS,
      PlanFeature.ADVANCED_NUDGES, // Customizable
      PlanFeature.SETU_AI_CHATBOT,
      PlanFeature.FACULTY_DASHBOARD,
      PlanFeature.FACULTY_ADVANCED_INSIGHTS,
      PlanFeature.ADMIN_PANEL,
      PlanFeature.EXPORT_REPORTS,
      PlanFeature.PRIORITY_SUPPORT,
    ],
  },
];

// Mock organization, in a real app this would come from a database after login
export const MOCK_ORGANIZATION_PLAN = PLANS[1]; // Default to Premium for mock
