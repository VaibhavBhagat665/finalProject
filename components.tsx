
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link, useLocation, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { UserRole, MoodRating, type Student, type Assignment, type MoodEntry, type Nudge, type FlaggedStudentSummary, type FacultyNote, type Plan, PlanFeature, type AuthContextType } from './types';
import {
  MOCK_STUDENT_DATA, MOCK_NUDGES, MOOD_OPTIONS, APP_NAME, APP_SLOGAN,
  AcademicCapIcon, ChecklistIcon, BrainIcon, UsersIcon, MessageSquareIcon, LightbulbIcon, DumbbellIcon, CoffeeIcon, ShieldCheckIcon, SparklesIcon, HomeIcon, DollarSignIcon, LogInIcon, LogOutIcon, BuildingOfficeIcon,
  CHATBOT_NAME, CHATBOT_SUGGESTIONS, MOCK_FACULTY_NOTES, PLANS, MoodHappyIcon, MoodSadIcon, MoodNeutralIcon
} from './constants';
import { sendMessageToGemini, isGeminiAvailable, convertMessagesToGeminiHistory, startChatSession } from './geminiService';
import type { ChatMessage } from './types';
import { AuthContext } from './App'; // Assuming App.tsx will export AuthContext


// --- Shared Components ---

export const Card: React.FC<{ children: React.ReactNode; className?: string; noPadding?: boolean }> = ({ children, className, noPadding }) => (
  <div className={`bg-slate-800 shadow-xl rounded-xl ${noPadding ? '' : 'p-6'} ${className}`}>
    {children}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'; size?: 'sm' | 'md' | 'lg'}> = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
  const baseStyle = "rounded-lg font-semibold focus:outline-none focus:ring-4 transition-all duration-150 ease-in-out inline-flex items-center justify-center";
  let variantStyle = "";
  let sizeStyle = "";

  switch(size) {
    case 'sm': sizeStyle = "px-4 py-2 text-xs"; break;
    case 'md': sizeStyle = "px-6 py-3 text-sm"; break;
    case 'lg': sizeStyle = "px-8 py-3 text-base"; break;
  }

  switch(variant) {
    case 'primary': variantStyle = "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/50 shadow-md hover:shadow-lg"; break;
    case 'secondary': variantStyle = "bg-slate-700 hover:bg-slate-600 text-slate-100 focus:ring-slate-500/50"; break;
    case 'danger': variantStyle = "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/50"; break;
    case 'ghost': variantStyle = "bg-transparent hover:bg-slate-700 text-blue-400 hover:text-blue-300 focus:ring-blue-500/50"; break;
    case 'outline': variantStyle = "bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white focus:ring-blue-500/50"; break;
  }
  return (
    <button className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }> = ({ label, id, error, ...props }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
    <input
      id={id}
      className={`w-full p-3 border ${error ? 'border-red-500' : 'border-slate-600'} bg-slate-700 rounded-lg focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent transition-shadow text-slate-200 placeholder-slate-400`}
      {...props}
    />
    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
  </div>
);

export const LoadingSpinner: React.FC<{size?: 'sm' | 'md' | 'lg'}> = ({size = 'md'}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  return (
    <div className={`animate-spin rounded-full border-t-4 border-blue-500 border-r-4 border-transparent border-solid ${sizeClasses[size]}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// --- Layout Components ---

export const Navbar: React.FC<{ onRoleChange?: (role: UserRole) => void }> = ({ onRoleChange }) => {
  const location = useLocation();
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const currentAuthRole = auth?.user?.role;

  const handleSignOut = () => {
    auth?.signOut();
    navigate('/');
  };

  const navItemsBase = [
    { path: '/', label: 'Home', icon: <HomeIcon className="w-5 h-5" />, show: 'always' },
    { path: '/pricing', label: 'Pricing', icon: <DollarSignIcon className="w-5 h-5" />, show: 'unauthenticated' },
    { path: '/auth', label: 'Sign In', icon: <LogInIcon className="w-5 h-5" />, show: 'unauthenticated' },
  ];

  const navItemsAuthenticatedDynamic = () => {
    const items = [];
    if (!auth?.isAuthenticated || !currentAuthRole) return items;

    items.push({ path: '/chatbot', label: 'SetuAI', icon: <MessageSquareIcon className="w-5 h-5" />, show: 'authenticated' });

    if (currentAuthRole === UserRole.STUDENT || currentAuthRole === UserRole.ADMIN || currentAuthRole === UserRole.FACULTY) {
         items.unshift({ path: '/student', label: 'My Dashboard', icon: <AcademicCapIcon className="w-5 h-5" />, show: 'authenticated' });
    }
    if (currentAuthRole === UserRole.FACULTY || currentAuthRole === UserRole.ADMIN) {
        items.push({ path: '/faculty', label: 'Faculty View', icon: <UsersIcon className="w-5 h-5" />, show: 'authenticated' });
    }
    if (currentAuthRole === UserRole.ADMIN) {
        items.push({ path: '/admin', label: 'Admin Panel', icon: <BuildingOfficeIcon className="w-5 h-5" />, show: 'authenticated' });
    }
    return items;
  }


  return (
    <nav className="bg-slate-800/80 backdrop-blur-md text-slate-200 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <BrainIcon className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">{APP_NAME}</h1>
        </Link>
        <div className="flex items-center space-x-1 md:space-x-2">
          {navItemsBase.map(item => {
            if (item.show === 'always' || (item.show === 'unauthenticated' && !auth?.isAuthenticated) || (item.show === 'authenticated' && auth?.isAuthenticated)) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors
                    ${location.pathname === item.path ? 'bg-slate-700 text-white' : 'text-slate-300 hover:text-white'}`}
                >
                  {item.icon}
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            }
            return null;
          })}
          {auth?.isAuthenticated && navItemsAuthenticatedDynamic().map(item => {
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors
                  ${location.pathname === item.path ? 'bg-slate-700 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                {item.icon}
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
          {auth?.isAuthenticated && (
            <Button onClick={handleSignOut} variant="ghost" size="sm" className="!px-3 !py-2">
              <LogOutIcon className="w-5 h-5 mr-0 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          )}
          {onRoleChange && auth?.isAuthenticated && (auth.user?.role === UserRole.ADMIN || auth.user?.role === UserRole.FACULTY) && (
            <div className="relative ml-2">
              <select
                value={auth.user?.role}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-3 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {auth.user?.role === UserRole.ADMIN && <option value={UserRole.ADMIN}>View as Admin</option>}
                {(auth.user?.role === UserRole.ADMIN || auth.user?.role === UserRole.FACULTY) && <option value={UserRole.FACULTY}>View as Faculty</option>}
                <option value={UserRole.STUDENT}>View as Student</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// --- Landing Page Components ---
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="text-slate-200 overflow-x-hidden">
      <section className="py-20 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900/30 relative">
         <div className="absolute inset-0 opacity-10"> </div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <BrainIcon className="w-20 h-20 text-blue-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400">
            {APP_NAME}
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto">{APP_SLOGAN}</p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4">
            <Button variant="primary" size="lg" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/pricing')}>
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 md:py-24 bg-slate-900">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-100">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<AcademicCapIcon className="w-10 h-10 text-blue-400 mb-4" />}
              title="Student Wellness Dashboard"
              description="Track academic trends, assignment patterns, and self-reported mood with personalized insights."
            />
            <FeatureCard
              icon={<MessageSquareIcon className="w-10 h-10 text-green-400 mb-4" />}
              title="SetuAI Chatbot"
              description="Confidential, AI-powered support for mood check-ins, mindfulness, and quick guidance."
            />
            <FeatureCard
              icon={<UsersIcon className="w-10 h-10 text-purple-400 mb-4" />}
              title="Faculty Insights"
              description="Early warnings for at-risk students with aggregated, pseudonymized data for timely intervention."
            />
            <FeatureCard
              icon={<ShieldCheckIcon className="w-10 h-10 text-yellow-400 mb-4" />}
              title="Privacy First"
              description="Data anonymization, end-to-end encryption, and opt-in features ensure student privacy."
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-slate-800/50">
        <div className="container mx-auto px-6 text-center">
          <BuildingOfficeIcon className="w-12 h-12 text-teal-400 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-100">For Educational Institutions</h2>
          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8">
            MindSetu offers tailored subscription plans for schools, colleges, and universities. Empower your students and faculty with tools designed to foster a proactive approach to mental wellness and academic success.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/pricing')}>
            Explore Institutional Plans
          </Button>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <SparklesIcon className="w-12 h-12 text-sky-400 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-100">Our Mission</h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              MindSetu aims to proactively support student mental well-being by providing tools for self-awareness and enabling educational institutions to offer timely, empathetic assistance. We believe in fostering a healthier and more supportive learning environment for everyone.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <Card className="text-center transform hover:scale-105 transition-transform duration-300 bg-slate-800 hover:bg-slate-700/80 shadow-2xl">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-slate-100">{title}</h3>
    <p className="text-slate-400 text-sm">{description}</p>
  </Card>
);

// --- Authentication Components ---
export const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (auth?.isAuthenticated) {
      const from = location.state?.from?.pathname || '';
      const userRole = auth.user?.role;
      let redirectPath = '/student'; 
      if (userRole === UserRole.FACULTY) redirectPath = '/faculty';
      else if (userRole === UserRole.ADMIN) redirectPath = '/admin';
      
      navigate(from && from !== '/auth' ? from : redirectPath, { replace: true });
    }
  }, [auth?.isAuthenticated, auth?.user?.role, navigate, location.state]);


  if (auth?.isLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <BrainIcon className="mx-auto h-12 w-auto text-blue-500" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-100">
            {isSignUp ? 'Create your MindSetu account' : 'Sign in to your account'}
          </h2>
        </div>
        <Card className="mt-8 space-y-6 shadow-2xl">
          {isSignUp ? <SignUpForm /> : <SignInForm />}
          <div className="text-sm text-center">
            <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-blue-400 hover:text-blue-300">
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

const SignInForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!auth) return;
    try {
      await auth.signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputField id="email-signin" label="Email address" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
      <InputField id="password-signin" label="Password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      <div>
        <Button type="submit" variant="primary" className="w-full" disabled={auth?.isLoading}>
          {auth?.isLoading ? <LoadingSpinner size="sm"/> : 'Sign In'}
        </Button>
      </div>
    </form>
  );
};

const SignUpForm: React.FC = () => {
  const [orgName, setOrgName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ADMIN); 
  const [error, setError] = useState('');
  const auth = useContext(AuthContext);
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!auth) return;
    try {
      await auth.signUp(orgName, userName, email, password, userRole);
      if (userRole === UserRole.ADMIN) {
        navigate('/admin', { replace: true });
      } else if (userRole === UserRole.FACULTY) {
        navigate('/faculty', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4">
        <label htmlFor="userRole" className="block text-sm font-medium text-slate-300 mb-1">Sign up as:</label>
        <select
          id="userRole"
          value={userRole}
          onChange={(e) => setUserRole(e.target.value as UserRole)}
          className="w-full p-3 border border-slate-600 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-200"
        >
          <option value={UserRole.ADMIN}>Organization Administrator</option>
          <option value={UserRole.FACULTY}>Faculty Member</option>
          <option value={UserRole.STUDENT}>Student</option>
        </select>
      </div>
      <InputField
        id="orgName"
        label={userRole === UserRole.ADMIN ? "Your Organization's Name" : "School/College Name"}
        type="text"
        required
        value={orgName}
        onChange={e => setOrgName(e.target.value)}
        placeholder={userRole === UserRole.ADMIN ? "E.g., Springfield University" : "E.g., Springfield High"}
      />
      <InputField id="userName" label="Your Full Name" type="text" required value={userName} onChange={e => setUserName(e.target.value)} />
      <InputField id="email-signup" label="Email address" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
      <InputField id="password-signup" label="Password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      <div>
        <Button type="submit" variant="primary" className="w-full" disabled={auth?.isLoading}>
          {auth?.isLoading ? <LoadingSpinner size="sm"/> : 'Sign Up'}
        </Button>
      </div>
    </form>
  );
};

// --- Pricing Components ---
export const PricingOrgInputPage: React.FC = () => {
  const [orgName, setOrgName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orgName.trim()) {
      navigate(`/pricing/plans?orgName=${encodeURIComponent(orgName.trim())}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center py-12 px-4">
      <Card className="max-w-lg w-full shadow-2xl">
        <BuildingOfficeIcon className="mx-auto h-12 w-auto text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold text-center text-slate-100 mb-6">View Plans for Your Institution</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            id="orgNamePricing"
            label="Organization Name"
            type="text"
            required
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
            placeholder="E.g., Springfield University"
          />
          <Button type="submit" variant="primary" className="w-full">View Plans</Button>
        </form>
      </Card>
    </div>
  );
};

export const PlanCard: React.FC<{ plan: Plan; onSelectPlan: (plan: Plan) => void; orgName?: string }> = ({ plan, onSelectPlan, orgName }) => (
  <Card className={`flex flex-col border-2 ${plan.highlight ? 'border-blue-500 shadow-blue-500/30' : 'border-slate-700'} transform hover:scale-105 transition-transform duration-200`}>
    {plan.highlight && <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr-lg">Most Popular</div>}
    <h3 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">{plan.name}</h3>
    <p className="text-4xl font-extrabold text-slate-100 text-center mb-1">
      ${plan.pricePerStudentPerMonth.toFixed(2)}
      <span className="text-base font-normal text-slate-400">/student/month</span>
    </p>
    <p className="text-sm text-slate-400 text-center mb-6 min-h-[40px]">{plan.description}</p>
    <ul className="space-y-2 mb-8 flex-grow">
      {plan.features.map(feature => (
        <li key={feature} className="flex items-center text-slate-300">
          <ChecklistIcon className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
          {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </li>
      ))}
    </ul>
    <Button variant={plan.highlight ? "primary" : "outline"} className="w-full mt-auto" onClick={() => onSelectPlan(plan)}>
      Choose {plan.name}
    </Button>
  </Card>
);

export const PricingPlansDisplayPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orgName = searchParams.get('orgName') || "Your Organization";
  const navigate = useNavigate();

  const handleSelectPlan = (plan: Plan) => {
    navigate(`/payment-confirmation?planId=${plan.id}&orgName=${encodeURIComponent(orgName)}`);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center text-slate-100 mb-4">
        Pricing for <span className="text-blue-400">{orgName}</span>
      </h1>
      <p className="text-center text-slate-300 mb-12 max-w-2xl mx-auto">
        Choose the plan that best fits your institution's needs. All plans are billed based on the number of active students.
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {PLANS.map(plan => (
          <PlanCard key={plan.id} plan={plan} onSelectPlan={handleSelectPlan} orgName={orgName} />
        ))}
      </div>
       <div className="text-center mt-12">
        <p className="text-slate-400">Need a custom solution or have more questions?</p>
        <Link to="/contact" className="text-blue-400 hover:text-blue-300 font-semibold">Contact Sales</Link>
      </div>
    </div>
  );
};

export const PaymentConfirmationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');
  const orgName = searchParams.get('orgName');
  const selectedPlan = PLANS.find(p => p.id === planId);
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!selectedPlan && !isProcessing) {
      navigate('/pricing', { replace: true });
    }
  }, [selectedPlan, navigate, isProcessing]);

  const handleConfirmSubscription = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    if (auth?.isAuthenticated && auth.organization && selectedPlan) {
      auth.updateOrganizationPlan(selectedPlan);
      const userRole = auth.user?.role;
      let redirectPath = '/student'; 
      if (userRole === UserRole.ADMIN) redirectPath = '/admin';
      else if (userRole === UserRole.FACULTY) redirectPath = '/faculty'; 
      else if (userRole === UserRole.STUDENT && auth.organization.name === orgName) redirectPath = '/student';
      navigate(redirectPath, { replace: true });

    } else if (!auth?.isAuthenticated && selectedPlan) {
        alert(`Your selection of the ${selectedPlan.name} plan for ${orgName} is noted. Please sign in or sign up. If signing up a new organization, this plan will be applied.`);
        navigate(`/auth?planId=${planId}&orgName=${encodeURIComponent(orgName || "")}&isSubscription=true`, { replace: true });
    } else {
        alert("There was an issue confirming the subscription. Please try again or contact support.");
        setIsProcessing(false); 
    }
  };

  if (!selectedPlan) {
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg"/>Searching for plan...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center py-12 px-4">
      <Card className="max-w-lg w-full shadow-2xl">
        <SparklesIcon className="mx-auto h-12 w-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-center text-slate-100 mb-2">Confirm Your Subscription</h2>
        <p className="text-center text-slate-300 mb-6">
          You are about to subscribe <strong className="text-blue-400">{orgName || "Your Organization"}</strong> to the <strong className="text-blue-400">{selectedPlan.name}</strong> plan.
        </p>
        <div className="bg-slate-700 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-slate-100">{selectedPlan.name} Plan</h3>
          <p className="text-2xl font-bold text-slate-100">${selectedPlan.pricePerStudentPerMonth.toFixed(2)}
            <span className="text-sm font-normal text-slate-400"> / student / month</span>
          </p>
          <ul className="mt-3 space-y-1 text-sm text-slate-300">
            {selectedPlan.features.map(feature => (
              <li key={feature} className="flex items-center">
                <ChecklistIcon className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-slate-400 text-center mb-6">
          This is a mock payment step. No real transaction will occur. By clicking "Confirm Subscription", you acknowledge the plan selection for your organization.
        </p>
        <Button
          variant="primary"
          className="w-full"
          onClick={handleConfirmSubscription}
          disabled={isProcessing}
        >
          {isProcessing ? <LoadingSpinner size="sm" /> : `Confirm Subscription to ${selectedPlan.name}`}
        </Button>
        <Button variant="ghost" className="w-full mt-3" onClick={() => navigate(-1)} disabled={isProcessing}>
            Back to Plans
        </Button>
      </Card>
    </div>
  );
};

// --- Admin Panel Component ---
export const AdminPanelPage: React.FC = () => {
  const auth = useContext(AuthContext);

  if (!auth?.isAuthenticated || auth.user?.role !== UserRole.ADMIN) {
    return <Navigate to="/" replace />; // Added replace to Navigate
  }

  const [users, setUsers] = useState([
    { id: 'userStudent', name: 'Student User', email: 'student@example.com', role: UserRole.STUDENT, status: 'Active' },
    { id: 'userFaculty', name: 'Dr. Faculty', email: 'faculty@example.com', role: UserRole.FACULTY, status: 'Active' },
    { id: 'userAdmin', name: 'Admin User', email: 'admin@example.com', role: UserRole.ADMIN, status: 'Active' },
    { id: 'userNew', name: 'Pending User', email: 'new@example.com', role: UserRole.STUDENT, status: 'Pending' },
  ]);
  const currentOrg = auth.organization;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-slate-100">Admin Panel</h2>
      <p className="text-slate-300">Manage your organization: <strong className="text-blue-400">{currentOrg?.name}</strong></p>

      <Card>
        <h3 className="text-xl font-semibold text-slate-100 mb-3">Organization Plan</h3>
        {currentOrg ? (
          <>
            <p className="text-slate-300">Current Plan: <span className="font-bold text-lg text-green-400">{currentOrg.plan.name}</span></p>
            <p className="text-slate-400 text-sm">{currentOrg.plan.description}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/pricing/plans?orgName=' + encodeURIComponent(currentOrg.name))}>
              Change Plan
            </Button>
          </>
        ) : (
          <p className="text-slate-400">Organization details not loaded.</p>
        )}
      </Card>

      <Card>
        <h3 className="text-xl font-semibold text-slate-100 mb-4">User Management</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 capitalize">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'Active' ? 'bg-green-700 text-green-100' : 'bg-yellow-700 text-yellow-100'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 mr-2">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button variant="primary" className="mt-6">Add New User</Button>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold text-slate-100 mb-3">Billing Information</h3>
        <p className="text-slate-400">Manage subscription and payment methods (Placeholder).</p>
        <Button variant="outline" size="sm" className="mt-3">Update Billing</Button>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold text-slate-100 mb-3">Reporting</h3>
        <p className="text-slate-400">Generate and export institutional reports (Placeholder).</p>
        <Button variant="outline" size="sm" className="mt-3">Export Data</Button>
      </Card>
    </div>
  );
};

// --- Chat Interface ---
export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessionInitialized, setChatSessionInitialized] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const auth = useContext(AuthContext);
  const navigate = useNavigate(); // Added for potential navigation on plan issues

  const geminiAvailable = isGeminiAvailable();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (geminiAvailable && !chatSessionInitialized) {
      const initialHistory = convertMessagesToGeminiHistory(messages.filter(m => m.sender !== 'system'));
      startChatSession(initialHistory)
        .then(() => {
          setChatSessionInitialized(true);
          if (!messages.some(m => m.sender === 'system' && m.text.includes(CHATBOT_NAME))) {
             setMessages(prev => [{id: 'sys-init', text: `Hi ${auth?.user?.name || 'there'}! I'm ${CHATBOT_NAME}. How can I help you today?`, sender: 'system', timestamp: new Date()}, ...prev]);
          }
        })
        .catch(error => {
          console.error("Failed to initialize chat session:", error);
          setMessages([{id: 'sys-error', text: "Could not initialize chat session. Please try again later.", sender: 'system', timestamp: new Date()}]);
        });
    }
  }, [geminiAvailable, chatSessionInitialized, messages, auth?.user?.name]);


  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !geminiAvailable || !chatSessionInitialized) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    const botMessageId = `bot-${Date.now()}`;
    setMessages(prev => [...prev, { id: botMessageId, text: '', sender: 'bot', timestamp: new Date(), isStreaming: true }]);

    let accumulatedResponse = "";
    try {
      await sendMessageToGemini(userMessage.text, (chunkText, isFinal) => {
        if (chunkText !== null && chunkText !== undefined) {
          accumulatedResponse += chunkText;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === botMessageId ? { ...msg, text: accumulatedResponse, isStreaming: !isFinal } : msg
            )
          );
        }
        if (isFinal) {
          setIsLoading(false);
          setMessages(prev => prev.map(msg => msg.id === botMessageId ? {...msg, isStreaming: false} : msg));
        }
      });
    } catch (error) {
      console.error("Error in Gemini response stream:", error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === botMessageId ? { ...msg, text: "Sorry, I encountered an error. Please try again.", sender: 'bot', isStreaming: false } : msg
        )
      );
      setIsLoading(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  if (!geminiAvailable) {
    return (
      <Card className="h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center">
        <MessageSquareIcon className="w-16 h-16 text-slate-500 mb-4" />
        <h3 className="text-xl font-semibold text-slate-300 mb-2">{CHATBOT_NAME} is currently unavailable.</h3>
        <p className="text-slate-400">The Chatbot service could not be initialized. This might be due to a missing API key configuration.</p>
        <p className="text-slate-500 text-xs mt-2">Please contact support if this issue persists.</p>
      </Card>
    );
  }

  return (
    <Card className="h-[calc(100vh-160px)] md:h-[calc(100vh-200px)] flex flex-col shadow-2xl" noPadding>
      <header className="bg-slate-700 p-4 border-b border-slate-600">
        <h2 className="text-xl font-semibold text-slate-100 flex items-center">
          <MessageSquareIcon className="w-6 h-6 mr-2 text-blue-400"/> {CHATBOT_NAME}
        </h2>
      </header>
      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-800/50">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow ${
              msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 
              msg.sender === 'bot' ? 'bg-slate-700 text-slate-200 rounded-bl-none' : 
              'bg-slate-600 text-slate-300 text-sm italic text-center w-full py-1'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text || (msg.isStreaming ? '...' : '')}</p>
              {msg.sender !== 'system' && <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {!isLoading && chatSessionInitialized && (
        <div className="p-2 border-t border-slate-600 bg-slate-700/30">
          <div className="flex flex-wrap gap-2 mb-2 px-2">
            {CHATBOT_SUGGESTIONS.map(suggestion => (
              <Button key={suggestion} variant="outline" size="sm" className="!text-xs !px-2 !py-1 border-slate-500 text-slate-300 hover:bg-slate-600" onClick={() => handleSuggestionClick(suggestion)}>
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
      <div className="p-4 border-t border-slate-600 bg-slate-700/50">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder={isLoading ? "Waiting for response..." : `Ask ${CHATBOT_NAME}...`}
            className="flex-grow p-3 border border-slate-600 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-200 placeholder-slate-400"
            disabled={isLoading || !chatSessionInitialized}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim() || !chatSessionInitialized} size="md">
            {isLoading ? <LoadingSpinner size="sm" /> : 'Send'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

// --- Student Dashboard Components ---

export const WellnessAvatar: React.FC<{ student: Student }> = ({ student }) => (
  <Card className="text-center">
    <img src={student.avatarUrl} alt={`${student.name}'s avatar`} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-500 shadow-lg" />
    <h3 className="text-xl font-semibold text-slate-100">{student.name}</h3>
    <p className="text-blue-400 font-bold text-lg">{student.wellnessPoints} Wellness Points</p>
  </Card>
);

export const NudgeDisplay: React.FC<{ nudges: Nudge[] }> = ({ nudges }) => {
  const [currentNudgeIndex, setCurrentNudgeIndex] = useState(0);

  useEffect(() => {
    if (nudges.length === 0) return;
    const timer = setInterval(() => {
      setCurrentNudgeIndex(prev => (prev + 1) % nudges.length);
    }, 10000); // Change nudge every 10 seconds
    return () => clearInterval(timer);
  }, [nudges.length]);

  if (nudges.length === 0) return null;
  const nudge = nudges[currentNudgeIndex];

  return (
    <Card className="bg-slate-800 hover:bg-slate-700/80 shadow-lg transition-all">
      <div className="flex items-start space-x-3">
        {nudge.icon && <div className="flex-shrink-0 text-blue-400 mt-1">{nudge.icon}</div>}
        <div>
          <h4 className="font-semibold text-slate-100">{nudge.title}</h4>
          <p className="text-sm text-slate-300">{nudge.content}</p>
        </div>
      </div>
    </Card>
  );
};

export const GPATrendChart: React.FC<{ data: { semester: string; gpa: number }[] }> = ({ data }) => (
  <Card>
    <h3 className="text-lg font-semibold mb-4 text-slate-100">GPA Trend</h3>
    {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="semester" tick={{ fill: '#A0AEC0', fontSize: 12 }} />
            <YAxis domain={[0, 4]} tick={{ fill: '#A0AEC0', fontSize: 12 }} />
            <Tooltip
            contentStyle={{ backgroundColor: '#2D3748', border: 'none', borderRadius: '0.5rem', color: '#E2E8F0' }}
            itemStyle={{ color: '#A0AEC0' }}
            />
            <Legend wrapperStyle={{ color: '#A0AEC0' }}/>
            <Line type="monotone" dataKey="gpa" stroke="#4299E1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
        </ResponsiveContainer>
    ) : <p className="text-slate-400 text-center py-10">No GPA data available.</p>}
  </Card>
);

export const AssignmentsList: React.FC<{ assignments: Assignment[] }> = ({ assignments }) => {
  const getStatusColor = (status: Assignment['status']) => {
    if (status === 'Submitted') return 'text-green-400';
    if (status === 'Late') return 'text-yellow-400';
    if (status === 'Missed') return 'text-red-400';
    return 'text-slate-400';
  };
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4 text-slate-100">Upcoming Assignments</h3>
      {assignments.length > 0 ? (
        <ul className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {assignments.filter(a => a.status === 'Pending').slice(0, 5).map(assign => (
            <li key={assign.id} className="p-3 bg-slate-700/50 rounded-lg shadow">
                <div className="flex justify-between items-center">
                <span className="text-slate-200 font-medium">{assign.name}</span>
                <span className={`text-xs font-semibold ${getStatusColor(assign.status)}`}>{assign.status}</span>
                </div>
                <p className="text-xs text-slate-400">Due: {new Date(assign.dueDate).toLocaleDateString()}</p>
            </li>
            ))}
            {assignments.filter(a => a.status === 'Pending').length === 0 && <p className="text-slate-400 text-center">No pending assignments.</p>}
        </ul>
      ) : <p className="text-slate-400 text-center py-10">No assignment data available.</p>}
    </Card>
  );
};

export const MoodTracker: React.FC<{
  currentMood?: MoodEntry;
  onMoodSubmit: (rating: MoodRating, journal?: string) => void;
  moodTrackingOptIn: boolean;
  onOptInChange: (optIn: boolean) => void;
}> = ({ currentMood, onMoodSubmit, moodTrackingOptIn, onOptInChange }) => {
  const [selectedRating, setSelectedRating] = useState<MoodRating | null>(currentMood?.rating || null);
  const [journal, setJournal] = useState(currentMood?.journal || '');

  const handleSubmit = () => {
    if (selectedRating) {
      onMoodSubmit(selectedRating, journal);
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-1 text-slate-100">How are you feeling today?</h3>
      <label className="flex items-center space-x-2 text-sm text-slate-400 mb-4">
        <input type="checkbox" checked={moodTrackingOptIn} onChange={e => onOptInChange(e.target.checked)} className="form-checkbox h-4 w-4 text-blue-500 bg-slate-600 border-slate-500 rounded focus:ring-blue-500/50"/>
        <span>Enable Mood Tracking</span>
      </label>

      {moodTrackingOptIn && (
        <>
          <div className="flex justify-around mb-4">
            {MOOD_OPTIONS.map(({ rating, label, Icon, colorClass }) => (
              <button
                key={rating}
                aria-label={label}
                title={label}
                onClick={() => setSelectedRating(rating)}
                className={`p-2 rounded-full transition-all duration-150 ${selectedRating === rating ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-blue-400 scale-110' : 'hover:opacity-80'}`}
              >
                <Icon className={`w-8 h-8 ${colorClass} ${selectedRating === rating ? 'opacity-100' : 'opacity-70'}`} />
              </button>
            ))}
          </div>
          {selectedRating && (
            <>
              <textarea
                value={journal}
                onChange={e => setJournal(e.target.value)}
                placeholder="Optional: Add a journal entry..."
                className="w-full p-2 border border-slate-600 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-200 placeholder-slate-400 text-sm min-h-[60px]"
                rows={2}
              />
              <Button onClick={handleSubmit} variant="primary" size="sm" className="w-full mt-3">
                {currentMood ? 'Update Mood' : 'Log Mood'}
              </Button>
            </>
          )}
        </>
      )}
      {!moodTrackingOptIn && <p className="text-slate-500 text-center text-sm py-4">Enable mood tracking to log your feelings and see trends.</p>}
    </Card>
  );
};

export const MoodTimelineChart: React.FC<{ moodEntries: MoodEntry[] }> = ({ moodEntries }) => {
  const data = moodEntries
    .slice(-30) // last 30 entries
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rating: entry.rating,
      journal: entry.journal
    }));

  const getMoodColor = (rating: MoodRating) => {
    const moodOption = MOOD_OPTIONS.find(opt => opt.rating === rating);
    // Tailwind doesn't work well with dynamic class strings like `fill-${color}-500`.
    // We need to return actual color hex codes or use predefined full classes.
    // For Cell fill, it expects a color string directly.
    if (moodOption) {
      if (moodOption.rating === MoodRating.VERY_SAD) return '#F87171'; // red-400
      if (moodOption.rating === MoodRating.SAD) return '#FBBF24'; // orange-400 (using amber-400 as substitute)
      if (moodOption.rating === MoodRating.NEUTRAL) return '#FACC15'; // yellow-400
      if (moodOption.rating === MoodRating.HAPPY) return '#4ADE80'; // green-400
      if (moodOption.rating === MoodRating.VERY_HAPPY) return '#60A5FA'; // sky-400
    }
    return '#9CA3AF'; // gray-400
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4 text-slate-100">Mood Timeline (Last 30 Entries)</h3>
       {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="date" tick={{ fill: '#A0AEC0', fontSize: 10 }} />
            <YAxis domain={[1, 5]} tickFormatter={(value) => MOOD_OPTIONS.find(m=>m.rating === value)?.label || ''} tickCount={5} tick={{ fill: '#A0AEC0', fontSize: 10 }}/>
            <Tooltip
              contentStyle={{ backgroundColor: '#2D3748', border: 'none', borderRadius: '0.5rem', color: '#E2E8F0' }}
              formatter={(value: number, name, props) => [value, MOOD_OPTIONS.find(m=>m.rating === value)?.label || 'Mood']}
              labelFormatter={(label, payload) => {
                const entry = payload?.[0]?.payload;
                return `${label}${entry?.journal ? `: ${entry.journal.substring(0,50)}...` : ''}`;
              }}
            />
            <Bar dataKey="rating" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getMoodColor(entry.rating as MoodRating)} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : <p className="text-slate-400 text-center py-10">No mood entries to display.</p>}
    </Card>
  );
};


// --- Faculty Dashboard Components ---
export const FlaggedStudentCard: React.FC<{ summary: FlaggedStudentSummary; onSelect: (studentId: string) => void }> = ({ summary, onSelect }) => {
  const moodOption = MOOD_OPTIONS.find(mo => mo.rating === summary.lastMood);
  return (
    <Card className="hover:shadow-blue-500/30 transition-shadow duration-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-slate-100">{summary.pseudonym}</h3>
        {moodOption && (
          <div title={`Last Mood: ${moodOption.label}`} className="flex items-center space-x-1 text-sm">
            <moodOption.Icon className={`w-5 h-5 ${moodOption.colorClass}`} />
            <span>{moodOption.label}</span>
          </div>
        )}
      </div>
      <p className="text-sm text-slate-300 mb-1">
        Risk Score: <span className={`font-bold ${summary.riskScore > 70 ? 'text-red-400' : summary.riskScore > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
          {summary.riskScore}/100
        </span>
      </p>
      <p className="text-sm text-slate-400 mb-4 h-10 overflow-hidden">Primary Concern: {summary.primaryConcern}</p>
      <Button variant="outline" size="sm" className="w-full" onClick={() => onSelect(summary.studentId)}>
        View Details
      </Button>
    </Card>
  );
};

export const StudentDetailView: React.FC<{
  student: Student;
  notes: FacultyNote[];
  onAddNote: (studentId: string, text: string) => void;
  onClose: () => void;
}> = ({ student, notes, onAddNote, onClose }) => {
  const [newNoteText, setNewNoteText] = useState('');
  const auth = useContext(AuthContext);
  // const canAddNotes = auth?.organization?.plan.features.includes(PlanFeature.FACULTY_ADVANCED_INSIGHTS); // Feature gating disabled

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNoteText.trim()) {
      onAddNote(student.id, newNoteText);
      setNewNoteText('');
    }
  };

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-100">Student Details: {student.name}</h2>
        <Button onClick={onClose} variant="secondary" size="sm">Close</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <WellnessAvatar student={student} />
        <Card className="lg:col-span-2">
            <h4 className="text-md font-semibold mb-2 text-slate-200">Risk Factors:</h4>
            {student.riskFactors && student.riskFactors.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                    {student.riskFactors.map((factor, i) => <li key={i}>{factor}</li>)}
                </ul>
            ) : <p className="text-slate-400">No specific risk factors identified.</p>}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GPATrendChart data={student.gpaHistory} />
        <AssignmentsList assignments={student.assignments} />
      </div>

      {student.moodEntries.length > 0 && <MoodTimelineChart moodEntries={student.moodEntries} />}
      
      {/* Feature Gating for Notes Disabled */}
      {/* {canAddNotes && ( */}
        <Card className="mt-6">
          <h3 className="text-xl font-semibold text-slate-100 mb-4">Faculty Notes</h3>
          <form onSubmit={handleAddNoteSubmit} className="mb-4">
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Add a new note (visible only to faculty)..."
              className="w-full p-2 border border-slate-600 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-200 placeholder-slate-400 text-sm"
              rows={3}
              required
            />
            <Button type="submit" variant="primary" size="sm" className="mt-2">Add Note</Button>
          </form>
          {notes.length > 0 ? (
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {notes.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(note => (
                <li key={note.id} className="p-3 bg-slate-700/50 rounded-lg shadow">
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{note.text}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    By {note.author} on {new Date(note.timestamp).toLocaleDateString()} at {new Date(note.timestamp).toLocaleTimeString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 text-center">No notes for this student yet.</p>
          )}
        </Card>
      {/* )} */}
    </Card>
  );
};

