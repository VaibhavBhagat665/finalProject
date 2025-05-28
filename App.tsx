
import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
    UserRole, MoodRating, type Student, type MoodEntry, type FacultyNote, type FlaggedStudentSummary,
    type AuthUser, type Organization, type Plan, type AuthContextType, PlanFeature
} from './types';
import {
  Navbar, GPATrendChart, AssignmentsList, MoodTracker, MoodTimelineChart, NudgeDisplay, WellnessAvatar,
  FlaggedStudentCard, StudentDetailView, ChatInterface, LoadingSpinner, Card, LandingPage, AuthPage,
  PricingOrgInputPage, PricingPlansDisplayPage, PaymentConfirmationPage, AdminPanelPage
} from './components';
import {
  MOCK_STUDENT_DATA, MOCK_NUDGES, DEFAULT_USER_ROLE, MOCK_FACULTY_FLAGGED_STUDENTS,
  MOCK_FACULTY_NOTES, MOCK_STUDENT_DATA_LOW_RISK, APP_NAME, APP_SLOGAN, PLANS
} from './constants';

// --- Mock Auth Context ---
export const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Simulate API calls

  // Mock sign-in
  const signIn = async (email: string, pass: string) => {
    setIsLoading(true);
    console.log("Attempting sign in for:", email)
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    let mockOrg: Organization;
    let mockUser: AuthUser;

    if (email === 'admin@example.com' && pass === 'password') {
      mockOrg = { id: 'org123', name: 'Springfield University', plan: PLANS.find(p => p.id === 'premium') || PLANS[0] };
      mockUser = { id: 'userAdmin', name: 'Admin User', email, role: UserRole.ADMIN, organizationId: mockOrg.id };
    } else if (email === 'faculty@example.com' && pass === 'password') {
      mockOrg = { id: 'org123', name: 'Springfield University', plan: PLANS.find(p => p.id === 'premium') || PLANS[0] };
      mockUser = { id: 'userFaculty', name: 'Dr. Faculty', email, role: UserRole.FACULTY, organizationId: mockOrg.id };
    } else if (email === 'student@example.com' && pass === 'password') {
       mockOrg = { id: 'org123', name: 'Springfield University', plan: PLANS.find(p => p.id === 'premium') || PLANS[0] };
      mockUser = { id: 'userStudent', name: 'Student User', email, role: UserRole.STUDENT, organizationId: mockOrg.id };
    }
     else {
      setIsLoading(false);
      throw new Error('Invalid credentials');
    }
    setUser(mockUser);
    setOrganization(mockOrg);
    setIsLoading(false);
  };

  // Mock sign-up
  const signUp = async (orgName: string, userName: string, email: string, pass: string, role: UserRole) => {
    setIsLoading(true);
    console.log("Attempting sign up for org:", orgName, "user:", userName, "as role:", role);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, create org and user in Firebase/backend
    const newOrg = { id: `org-${Date.now()}`, name: orgName, plan: PLANS[0] }; // Default to Basic plan
    setUser({ id: `user-${Date.now()}`, name: userName, email, role: role, organizationId: newOrg.id }); // Use passed role
    setOrganization(newOrg);
    setIsLoading(false);
  };

  const signOut = () => {
    setUser(null);
    setOrganization(null);
  };

  const updateOrganizationPlan = (newPlan: Plan) => {
    if (organization) {
      setOrganization(prevOrg => prevOrg ? {...prevOrg, plan: newPlan} : null);
      console.log(`Organization ${organization.name} plan updated to ${newPlan.name}`);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, organization, isLoading, signIn, signUp, signOut, updateOrganizationPlan }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Protected Route Component ---
const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: UserRole[]; /* feature?: PlanFeature // Feature gating disabled */ }> = ({ children, roles, /* feature */ }) => {
  const auth = useContext(AuthContext);
  const location = useLocation();

  if (auth?.isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (!auth?.isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, navigating to /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (roles && auth.user && !roles.includes(auth.user.role)) {
    console.log(`ProtectedRoute: Role mismatch (user: ${auth.user.role}, needed: ${roles}), navigating to /`);
    // Navigate to a default dashboard or home if role mismatch
    let defaultPath = '/';
    if(auth.user.role === UserRole.STUDENT) defaultPath = '/student';
    if(auth.user.role === UserRole.FACULTY) defaultPath = '/faculty';
    if(auth.user.role === UserRole.ADMIN) defaultPath = '/admin';
    return <Navigate to={defaultPath} replace />;
  }

  /* // Feature gating temporarily disabled
  if (feature && auth.organization && !auth.organization.plan.features.includes(feature)) {
     console.log(`ProtectedRoute: Feature ${feature} not available for plan ${auth.organization.plan.name}, navigating to /`);
     return <Navigate to="/" replace />; // Or a "feature not available" page
  }
  */

  return <>{children}</>; // Use React Fragment or just children
};


// --- Main Pages/Views as Components within App.tsx ---

const StudentDashboardPage: React.FC = () => {
  const [studentData, setStudentData] = useState<Student>(MOCK_STUDENT_DATA);
  const [moodTrackingOptIn, setMoodTrackingOptIn] = useState(true);
  const auth = useContext(AuthContext);

  const handleMoodSubmit = useCallback((rating: MoodRating, journal?: string) => {
    setStudentData(prev => {
      const newEntry: MoodEntry = {
        id: `mood-${Date.now()}`,
        date: new Date().toISOString(),
        rating,
        journal,
      };
      const todayDateStr = new Date().toISOString().split('T')[0];
      const existingTodayEntryIndex = prev.moodEntries.findIndex(me => me.date.startsWith(todayDateStr));

      let updatedMoodEntries;
      if (existingTodayEntryIndex !== -1) {
        updatedMoodEntries = [...prev.moodEntries];
        updatedMoodEntries[existingTodayEntryIndex] = newEntry;
      } else {
        updatedMoodEntries = [...prev.moodEntries, newEntry];
      }

      // Temporarily disable feature gating for wellness points - always award
      const wellnessPointsGain = rating >= MoodRating.HAPPY ? 20 : 5;
      // let wellnessPointsGain = 0;
      // if(auth?.organization?.plan.features.includes(PlanFeature.WELLNESS_POINTS)){
      //     wellnessPointsGain = rating >= MoodRating.HAPPY ? 20 : 5;
      // }

      return {
        ...prev,
        moodEntries: updatedMoodEntries,
        wellnessPoints: prev.wellnessPoints + wellnessPointsGain,
      };
    });
  }, [auth]); // auth removed from dependencies as plan check is disabled

  const todayMoodEntry = useMemo(() => {
    const todayDateStr = new Date().toISOString().split('T')[0];
    return studentData.moodEntries.find(me => me.date.startsWith(todayDateStr));
  }, [studentData.moodEntries]);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <WellnessAvatar student={studentData} />
        </div>
        <div className="md:col-span-2">
           {/* Feature Gating Disabled: auth?.organization?.plan.features.includes(PlanFeature.BASIC_NUDGES) && */ <NudgeDisplay nudges={MOCK_NUDGES} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feature Gating Disabled: auth?.organization?.plan.features.includes(PlanFeature.BASIC_ANALYTICS) && */ <GPATrendChart data={studentData.gpaHistory} />}
        {/* Feature Gating Disabled: auth?.organization?.plan.features.includes(PlanFeature.BASIC_ANALYTICS) && */ <AssignmentsList assignments={studentData.assignments} />}
        {/* Feature Gating Disabled: auth?.organization?.plan.features.includes(PlanFeature.MOOD_TRACKING) && */
            <MoodTracker
            currentMood={todayMoodEntry}
            onMoodSubmit={handleMoodSubmit}
            moodTrackingOptIn={moodTrackingOptIn}
            onOptInChange={setMoodTrackingOptIn}
            />
        }
      </div>
      { moodTrackingOptIn &&
        /* Feature Gating Disabled: auth?.organization?.plan.features.includes(PlanFeature.MOOD_TIMELINE) && */
        studentData.moodEntries.length > 0 && (
        <MoodTimelineChart moodEntries={studentData.moodEntries} />
      )}
      {!moodTrackingOptIn && /* Feature Gating Disabled: auth?.organization?.plan.features.includes(PlanFeature.MOOD_TRACKING) && */ (
        <Card className="text-center text-slate-400">
            <p>Mood timeline is hidden because mood tracking is disabled. Enable it in the "How are you feeling?" section to see your mood history.</p>
        </Card>
      )}
    </div>
  );
};

const FacultyDashboardPage: React.FC = () => {
  const [flaggedStudents] = useState<FlaggedStudentSummary[]>(MOCK_FACULTY_FLAGGED_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentNotes, setStudentNotes] = useState<{[key: string]: FacultyNote[]}>(MOCK_FACULTY_NOTES);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const auth = useContext(AuthContext);

  // Feature check for advanced details (like adding notes) is implicitly disabled
  // by not restricting the onAddNote callback in StudentDetailView.
  // const canViewAdvancedDetails = auth?.organization?.plan.features.includes(PlanFeature.FACULTY_ADVANCED_INSIGHTS);

  const handleSelectStudent = useCallback((studentId: string) => {
    setIsLoadingDetails(true);
    setTimeout(() => { // Simulate API call
      let foundStudent: Student | null = null;
      if (studentId === 'student123_anon') foundStudent = MOCK_STUDENT_DATA;
      else if (studentId === 'student789_anon') {
        foundStudent = {
            ...MOCK_STUDENT_DATA_LOW_RISK,
            id: 'student789_anon', name: 'Student Beta (Pseudonym)', riskScore: 80,
            riskFactors: ["Multiple consecutive missed assignments", "No recent mood logs", "Significant GPA drop last semester"],
            assignments: [
                ...MOCK_STUDENT_DATA_LOW_RISK.assignments,
                {id: 'c1', name: 'Project Proposal', dueDate: '2024-03-20', status: 'Missed'},
                {id: 'c2', name: 'Midterm Exam', dueDate: '2024-03-25', status: 'Missed'}
            ],
            gpaHistory: MOCK_STUDENT_DATA.gpaHistory
        };
      } else if (studentId === 'student001_anon') {
         foundStudent = {...MOCK_STUDENT_DATA_LOW_RISK, id: 'student001_anon', name: 'Student Gamma (Pseudonym)', riskScore: 55, riskFactors: ["Slight dip in last quiz score", "One late assignment"]};
      }
      setSelectedStudent(foundStudent);
      setIsLoadingDetails(false);
    }, 500);
  }, []);

  const handleAddNote = useCallback((studentId: string, text: string) => {
    const newNote: FacultyNote = {
        id: `note-${Date.now()}`,
        timestamp: new Date().toISOString(),
        text,
        author: auth?.user?.name || 'Faculty Member'
    };
    setStudentNotes(prev => ({
        ...prev,
        [studentId]: [...(prev[studentId] || []), newNote]
    }));
  }, [auth?.user?.name]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-slate-100">Faculty Dashboard</h2>
      <p className="text-slate-300 mb-6">Overview of students flagged by the early warning system. Student data is pseudonymized.</p>

      {isLoadingDetails && <div className="flex justify-center p-10"><LoadingSpinner size="lg"/></div>}

      {!selectedStudent && !isLoadingDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flaggedStudents.map(summary => (
            <FlaggedStudentCard key={summary.studentId} summary={summary} onSelect={handleSelectStudent} />
          ))}
        </div>
      )}

      {selectedStudent && !isLoadingDetails && (
        <StudentDetailView
            student={selectedStudent}
            notes={studentNotes[selectedStudent.id] || []}
            onAddNote={handleAddNote} // Feature gating for notes implicitly disabled
            onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

const ChatbotView: React.FC = () => {
  return (
    <div className="container mx-auto p-0 sm:p-4 md:p-6 h-full">
      <ChatInterface />
    </div>
  );
};

// --- Main App Component Structure ---
const AppContent: React.FC = () => {
  const auth = useContext(AuthContext);
  // currentRoleForView is primarily for admin/faculty "view as" functionality.
  // Actual access control is handled by ProtectedRoute based on auth.user.role.
  const [currentRoleForView, setCurrentRoleForView] = useState<UserRole>(auth?.user?.role || DEFAULT_USER_ROLE);

  useEffect(() => {
    if (auth?.user?.role) {
      setCurrentRoleForView(auth.user.role);
    } else {
      setCurrentRoleForView(DEFAULT_USER_ROLE);
    }
  }, [auth?.user?.role]);

  const handleRoleChangeForView = (role: UserRole) => {
    if (auth?.user?.role === UserRole.ADMIN || auth?.user?.role === UserRole.FACULTY) {
        setCurrentRoleForView(role);
        // This state change is for UI hints; actual routing/data access uses auth.user.role
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col">
      <Navbar onRoleChange={handleRoleChangeForView} />
      <main className="flex-grow pt-20 md:pt-24">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/pricing" element={<PricingOrgInputPage />} />
          <Route path="/pricing/plans" element={<PricingPlansDisplayPage />} />
          <Route path="/payment-confirmation" element={<PaymentConfirmationPage />} />

          <Route
            path="/student"
            element={
              <ProtectedRoute roles={[UserRole.STUDENT, UserRole.ADMIN, UserRole.FACULTY]}> {/* Allow Admin/Faculty to view student dash */}
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty"
            element={
              <ProtectedRoute roles={[UserRole.FACULTY, UserRole.ADMIN]} /* feature={PlanFeature.FACULTY_DASHBOARD} // Feature gating disabled */>
                <FacultyDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={[UserRole.ADMIN]} /* feature={PlanFeature.ADMIN_PANEL} // Feature gating disabled */>
                <AdminPanelPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute roles={[UserRole.STUDENT, UserRole.FACULTY, UserRole.ADMIN]} /* feature={PlanFeature.SETU_AI_CHATBOT} // Feature gating disabled */>
                <ChatbotView />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="text-center py-6 text-sm text-slate-400 bg-slate-800 border-t border-slate-700">
        &copy; {new Date().getFullYear()} {APP_NAME}. {APP_SLOGAN}. All rights reserved.
      </footer>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
