import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import IconsaxIcon from '@/components/ui/IconsaxIcon';
import { ThemeToggle } from './ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type NavItem = {
  icon: string;
  label: string;
  to: string;
  iconActive?: (path: string) => boolean;
};

interface NavigationProps {
  children?: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const location = useLocation();
  const { profile, userRole, isAdmin, isJuniorAdmin, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth < 768;
      setIsMobile(mobileView);
      if (!mobileView) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Student navigation items
  const studentNavItems = [
    { 
      icon: 'Home', 
      label: 'Home', 
      to: '/home',
      iconActive: (path: string) => path === '/home' || path === '/',
    },
    { 
      icon: 'Calendar', 
      label: 'Events', 
      to: '/events',
      iconActive: (path: string) => path === '/events' || path.startsWith('/events/'),
    },
    { 
      icon: 'Shop', 
      label: 'Stalls', 
      to: '/stalls',
      iconActive: (path: string) => path === '/stalls' || path.startsWith('/stalls/'),
    },
    { 
      icon: 'People', 
      label: 'Organizers', 
      to: '/organizers',
      iconActive: (path: string) => path === '/organizers' || path.startsWith('/organizers/'),
    },
    { 
      icon: 'AddCircle', 
      label: 'Register Stall', 
      to: '/register-stall',
      iconActive: (path: string) => path === '/register-stall' || path.startsWith('/register-stall/'),
    },
    { 
      icon: 'Gallery', 
      label: 'Media', 
      to: '/media',
      iconActive: (path: string) => path === '/media' || path.startsWith('/media/'),
    },
    { 
      icon: 'Message', 
      label: 'Contact', 
      to: '/contact',
      iconActive: (path: string) => path === '/contact' || path.startsWith('/contact/'),
    },
    { 
      icon: 'Award', 
      label: 'Certificates', 
      to: '/certificates',
      iconActive: (path: string) => path === '/certificates' || path.startsWith('/certificates/'),
    },
    { 
      icon: 'User', 
      label: 'Profile', 
      to: '/profile',
      iconActive: (path: string) => path === '/profile' || path.startsWith('/profile/'),
    },
  ];

  // Admin navigation items
  const adminNavItems: NavItem[] = [
    { 
      icon: 'Category', 
      label: 'Dashboard', 
      to: '/admin/dashboard',
      iconActive: (path: string) => 
        path === '/admin' || 
        path === '/admin/' || 
        path === '/admin/dashboard' ||
        path.startsWith('/admin/dashboard/')
    },
    { 
      icon: 'Calendar', 
      label: 'Manage Events', 
      to: '/admin/events',
      iconActive: (path: string) => 
        path === '/admin/events' || 
        path.startsWith('/admin/events/')
    },
    { 
      icon: 'Setting', 
      label: 'Manage Stalls', 
      to: '/admin/stalls',
      iconActive: (path: string) => 
        path === '/admin/stalls' || 
        path.startsWith('/admin/stalls/')
    },
    { 
      icon: 'Shop', 
      label: 'View All Stalls', 
      to: '/admin/stalls-view',
      iconActive: (path: string) => 
        path === '/admin/stalls-view' || 
        path.startsWith('/admin/stalls-view/')
    },
    { 
      icon: 'People', 
      label: 'Organizers', 
      to: '/organizers',
      iconActive: (path: string) => 
        path === '/organizers' || 
        path.startsWith('/organizers/')
    },
    { 
      icon: 'DocumentText', 
      label: 'Forms Builder', 
      to: '/admin/forms',
      iconActive: (path: string) => 
        path === '/admin/forms' || 
        path.startsWith('/admin/forms/')
    },
    { 
      icon: 'Award', 
      label: 'Certificates', 
      to: '/admin/certificates',
      iconActive: (path: string) => 
        path === '/admin/certificates' || 
        path.startsWith('/admin/certificates/')
    },
    { 
      icon: 'Message', 
      label: 'Communications', 
      to: '/admin/communications',
      iconActive: (path: string) => 
        path === '/admin/communications' || 
        path.startsWith('/admin/communications/')
    },
    { 
      icon: 'Gallery', 
      label: 'Media', 
      to: '/media',
      iconActive: (path: string) => 
        path === '/media' || 
        path.startsWith('/media/')
    },
    { 
      icon: 'MessageText1', 
      label: 'Contact Submissions', 
      to: '/admin/contact-submissions',
      iconActive: (path: string) => 
        path === '/admin/contact-submissions' || 
        path.startsWith('/admin/contact-submissions/')
    }
  ];

  const displayItems: NavItem[] = (isAdmin || isJuniorAdmin) ? adminNavItems : studentNavItems;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex flex-1 overflow-hidden" style={{ height: '100vh' }}>
        {/* Desktop Sidebar */}
        <aside 
          className={`hidden md:flex flex-col transition-all duration-300 ease-in-out fixed h-full z-30 ${
            isCollapsed ? 'w-20' : 'w-64'
          } bg-card border-r border-border`}
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            willChange: 'width, transform',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="flex flex-col h-full">
            {/* Logo and Toggle */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  
                  {!isCollapsed && (
                    <span className="font-bold text-foreground text-lg">Kala Kranthi</span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {!isCollapsed && <ThemeToggle />}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  >
                    <IconsaxIcon 
                      name={isCollapsed ? "ArrowRight2" : "ArrowLeft2"} 
                      size={20}
                      variant="Linear"
                      className="transition-transform duration-200"
                    />
                  </Button>
                </div>
              </div>
            </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4 px-2">
            <nav className="space-y-1">
              {displayItems.map((item) => {
                const isActive = item.iconActive ? item.iconActive(location.pathname) : location.pathname === item.to;
                return (
                  <div key={item.to} className="relative group">
                    <Link
                      to={item.to}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-all duration-200 focus:outline-none focus:ring-0 ${
                        isActive 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-primary/5' : 'group-hover:bg-accent'}`}>
                        <IconsaxIcon 
                          name={item.icon} 
                          variant={isActive ? 'Bold' : 'Linear'}
                          size={20}
                          className={`flex-shrink-0 ${isActive ? 'text-primary' : 'group-hover:text-foreground'}`}
                          aria-hidden="true"
                        />
                      </div>
                      {!isCollapsed && (
                        <span className="ml-3 truncate">
                          {item.label}
                        </span>
                      )}
                    </Link>
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1.5 bg-card text-foreground text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 pointer-events-none shadow-lg border border-border">
                        {item.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Profile Section - Always at the bottom */}
          <div className="p-4 border-t border-border mt-auto">
            <div className={`transition-all duration-200 ${isCollapsed ? 'px-0' : 'px-2'}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`w-full flex items-center rounded-lg p-2 transition-colors ${
                    isCollapsed ? 'justify-center' : 'justify-between hover:bg-accent'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {profile?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {!isCollapsed && (
                        <div className="text-left overflow-hidden">
                          <p className="text-sm font-medium text-foreground truncate">
                            {profile?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {userRole || 'Student'}
                          </p>
                        </div>
                      )}
                    </div>
                    {!isCollapsed && (
                      <IconsaxIcon 
                        name="ArrowDown2" 
                        size={16} 
                        className="text-muted-foreground flex-shrink-0" 
                      />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start" sideOffset={10}>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full cursor-pointer focus:outline-none focus:ring-0">
                      <IconsaxIcon name="User" className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={signOut}
                    className="w-full text-left p-2 text-foreground hover:bg-accent rounded cursor-pointer"
                  >
                    <IconsaxIcon name="Logout" className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <main 
            className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-background"
            style={{
              marginLeft: isMobile ? 0 : (isCollapsed ? '5rem' : '16rem'),
              transition: 'margin 0.3s ease',
              maxHeight: '100vh',
              overflowY: 'auto',
              scrollBehavior: 'smooth'
            }}
          >
            <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
