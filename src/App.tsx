import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import WhatsAppPopup from '@/components/WhatsAppPopup';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ThemeProvider from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import MobileAppBar from './components/MobileAppBar';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Stalls from './pages/StallsNew';
import Events from './pages/Events';
import Certificates from './pages/Certificates';
import FormSubmit from './pages/FormSubmit';
import AdminFormResponses from './pages/admin/AdminFormResponses';
import AdminStallsView from './pages/admin/AdminStallsView';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import RegisterStall from './pages/RegisterStall';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStalls from './pages/AdminStalls';
import AdminEvents from './pages/admin/AdminEvents';
import AdminCertificates from './pages/admin/AdminCertificates';
import AdminForms from './pages/admin/AdminForms';
import AdminEntrepreneurs from './pages/admin/AdminEntrepreneurs';
import AdminCommunications from './pages/admin/AdminCommunications';
import AdminContactSubmissions from './pages/admin/AdminContactSubmissions';
import Gallery from './pages/Gallery';
import Media from './pages/Media';
import Volunteers from './pages/Volunteers';
import EntrepreneurRegister from './pages/EntrepreneurRegister';
import Contact from './pages/Contact';
import Organizers from './pages/Organizers';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

// This component handles the authenticated routes
function AuthenticatedApp() {
  const { user, userRole } = useAuth();
  
  // Redirect to appropriate dashboard based on user role
  if (user) {
    if (userRole === 'admin' || userRole === 'junior_admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/home" replace />;
  }
  
  return <Navigate to="/" replace />;
}

// Main app content with all routes
function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  
  // Hide MobileAppBar on landing page and auth page
  const shouldShowMobileAppBar = !['/', '/auth'].includes(location.pathname);
  const isEntrepreneurSubdomain = typeof window !== 'undefined' && /^(entrepreneur|ec)\./i.test(window.location.hostname);
  if (isEntrepreneurSubdomain) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 w-full mx-auto px-2 md:p-0 pt-0">
          <Routes>
            <Route path="/" element={<EntrepreneurRegister />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {shouldShowMobileAppBar && <MobileAppBar />}
      <div className={cn(
        'flex-1 w-full mx-auto',
        'px-2', // Horizontal padding only
        'md:p-0', // Remove padding on desktop
        shouldShowMobileAppBar ? 'pt-14 pb-14' : 'pt-0' // Account for top and bottom app bars
      )}>
        <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/form/:formId" element={<FormSubmit />} />
        
        {/* Authenticated routes */}
        <Route 
          element={
            <Navigation>
              <Outlet />
            </Navigation>
          }
        >
          <Route path="home" element={<Home />} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="stalls" element={<Stalls />} />
          <Route path="events" element={<Events />} />
          <Route path="organizers" element={<Organizers />} />
          <Route path="volunteers" element={<Volunteers />} />
          <Route path="entrepreneur-cell/register" element={<EntrepreneurRegister />} />
          <Route path="certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="register-stall" element={<ProtectedRoute><RegisterStall /></ProtectedRoute>} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="media" element={<Media />} />
          <Route path="contact" element={<Contact />} />
          
          {/* Admin routes */}
          <Route path="admin">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="stalls" element={<ProtectedRoute><AdminStalls /></ProtectedRoute>} />
            <Route path="events" element={<ProtectedRoute><AdminEvents /></ProtectedRoute>} />
            <Route path="certificates" element={<ProtectedRoute><AdminCertificates /></ProtectedRoute>} />
            <Route path="forms" element={<ProtectedRoute><AdminForms /></ProtectedRoute>} />
            <Route path="forms/:formId/responses" element={<ProtectedRoute><AdminFormResponses /></ProtectedRoute>} />
            <Route path="entrepreneurs" element={<ProtectedRoute><AdminEntrepreneurs /></ProtectedRoute>} />
            <Route path="contact-submissions" element={<ProtectedRoute><AdminContactSubmissions /></ProtectedRoute>} />
            <Route path="communications" element={<ProtectedRoute requireAdmin><AdminCommunications /></ProtectedRoute>} />
            <Route path="stalls-view" element={<ProtectedRoute requireAdmin><AdminStallsView /></ProtectedRoute>} />
          </Route>
          
          {/* Redirect to home if no route matches */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
        
        {/* Handle authentication redirects */}
        <Route path="/app" element={<AuthenticatedApp />} />
        
        {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <AppContent />
            <WhatsAppPopup />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
