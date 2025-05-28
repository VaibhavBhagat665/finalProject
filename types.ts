import React from 'react';

export enum UserRole {
  STUDENT = 'student',
  FACULTY = 'faculty',
  ADMIN = 'admin', // Added Admin role for organization management
}

export interface Student {
  id: string; // Anonymized ID
  name: string; // Real name for student view, pseudonym for faculty
  avatarUrl: string;
  gpaHistory: { semester: string; gpa: number }[];
  assignments: Assignment[];
  moodEntries: MoodEntry[];
  riskScore?: number;
  riskFactors?: string[];
  wellnessPoints: number;
}

export interface Assignment {
  id: string;
  name: string;
  dueDate: string;
  submittedDate?: string;
  status: 'Submitted' | 'Late' | 'Missed' | 'Pending';
}

export enum MoodRating {
  VERY_SAD = 1,
  SAD = 2,
  NEUTRAL = 3,
  HAPPY = 4,
  VERY_HAPPY = 5,
}

export interface MoodEntry {
  id: string;
  date: string; // ISO string
  rating: MoodRating;
  journal?: string;
}

export interface Nudge {
  id: string;
  title: string;
  content: string;
  type: 'study' | 'mindfulness' | 'activity' | 'resource';
  icon?: React.ReactNode;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
  isStreaming?: boolean;
}

export interface FacultyNote {
  id: string;
  timestamp: string; // ISO string
  text: string;
  author: string; // Faculty member name
}

export interface FlaggedStudentSummary {
  studentId: string; // Anonymized
  pseudonym: string;
  riskScore: number;
  primaryConcern: string; // e.g., "Declining Grades"
  lastMood?: MoodRating;
}

// --- New Types for Pricing and Auth ---

export enum PlanFeature {
  BASIC_ANALYTICS = 'basic_analytics', // GPA, Assignments
  MOOD_TRACKING = 'mood_tracking', // Opt-in, current mood log
  MOOD_TIMELINE = 'mood_timeline', // Historical mood chart
  WELLNESS_POINTS = 'wellness_points',
  BASIC_NUDGES = 'basic_nudges',
  ADVANCED_NUDGES = 'advanced_nudges', // Customizable
  SETU_AI_CHATBOT = 'setu_ai_chatbot',
  FACULTY_DASHBOARD = 'faculty_dashboard', // Basic view
  FACULTY_ADVANCED_INSIGHTS = 'faculty_advanced_insights', // Detailed student view, notes
  ADMIN_PANEL = 'admin_panel', // Manage students, billing
  EXPORT_REPORTS = 'export_reports',
  PRIORITY_SUPPORT = 'priority_support',
}

export interface Plan {
  id: string;
  name: string;
  pricePerStudentPerMonth: number;
  description: string;
  features: PlanFeature[];
  highlight?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  plan: Plan;
  // other details like number of students, billing info would go here
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole; // Could be admin for the org, or faculty/student if directly associated
  organizationId: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  organization: Organization | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<void>; // Passwords should not be handled like this in reality
  signUp: (orgName: string, userName: string, email: string, pass: string, role: UserRole) => Promise<void>;
  signOut: () => void;
  updateOrganizationPlan: (plan: Plan) => void; // For after "payment"
}