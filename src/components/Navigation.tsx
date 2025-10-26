import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect, useRef } from 'react';
import IconsaxIcon from '@/components/ui/IconsaxIcon';
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
      label: 'Gallery', 
      to: '/gallery',
      iconActive: (path: string) => path === '/gallery' || path.startsWith('/gallery/'),
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
      label: 'Gallery', 
      to: '/gallery',
      iconActive: (path: string) => 
        path === '/gallery' || 
        path.startsWith('/gallery/')
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1 overflow-hidden" style={{ height: '100vh' }}>
        {/* Desktop Sidebar */}
        <aside 
          className={`hidden md:flex flex-col bg-white border-r transition-all duration-300 ease-in-out fixed h-[calc(100vh-3.5rem)] z-30 ${
            isCollapsed ? 'w-20' : 'w-72'
          }`}
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            willChange: 'width, transform'
          }}
        >
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
          <div className="flex flex-col justify-center h-[100px] px-6 border-b">
            <div className="flex items-center">
              {!isCollapsed && <h1 className="text-2xl font-bold text-gray-800">Kala Kranti</h1>}
              <Button
                variant="ghost"
                size="icon"
                className={`ml-auto h-10 w-10 ${isCollapsed ? 'mx-auto' : ''}`}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <IconsaxIcon 
                  name={isCollapsed ? "ArrowRight2" : "ArrowLeft2"} 
                  size={20}
                  variant="Linear"
                />
              </Button>
            </div>
            {!isCollapsed && (
              <p className="text-sm text-gray-500 mt-1">Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}</p>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar mt-2">
            <nav className="px-2 py-4 space-y-1">
              {displayItems.map((item) => {
                const isActive = item.iconActive ? item.iconActive(location.pathname) : location.pathname === item.to;
                return (
                  <div key={item.to} className="relative group">
                    <Link
                      to={item.to}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-all duration-200 focus:outline-none focus:ring-0 ${
                        isActive 
                          ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 transform hover:translate-x-1'
                      }`}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <IconsaxIcon 
                        name={item.icon} 
                        variant={isActive ? 'Bold' : 'Linear'}
                        size={20}
                        className={`flex-shrink-0 ${
                          isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                        }`}
                        aria-hidden="true"
                      />
                      {!isCollapsed && <span className="ml-3 truncate">{item.label}</span>}
                    </Link>
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                        {item.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Profile Section - Always at the bottom */}
          <div className="p-2 border-t mt-auto bg-white">
            {isCollapsed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="center" sideOffset={10}>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full cursor-pointer focus:outline-none focus:ring-0">
                      <IconsaxIcon name="User" className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={signOut}
                    className="w-full cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <IconsaxIcon name="Logout" className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-gray-900 truncate">{profile?.full_name || 'User'}</p>
                      <p className="text-sm text-gray-500 capitalize">{userRole || 'Student'}</p>
                    </div>
                    <IconsaxIcon name="ArrowDown2" size={16} className="text-gray-500 flex-shrink-0" />
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
                    className="w-full cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <IconsaxIcon name="Logout" className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <main 
            className={`min-h-full transition-all duration-300 ease-in-out ${
              isCollapsed ? 'md:pl-20' : 'md:pl-72'
            }`}
            style={{
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              willChange: 'margin-left',
              minHeight: '100%',
              maxHeight: 'calc(100vh - 3.5rem)',
              overflowY: 'auto'
            }}
          >
            <div className="p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>

    </div>
  );
}
