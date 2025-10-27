import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import IconsaxIcon from '@/components/ui/IconsaxIcon';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type NavItem = {
  icon: any;
  label: string;
  to: string;
  iconActive?: (path: string) => boolean;
  adminOnly?: boolean;
  studentOnly?: boolean;
};

export default function MobileAppBar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut, isAdmin, isJuniorAdmin } = useAuth();
  const [activePath, setActivePath] = useState(location.pathname);

  // Update active path when location changes
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  // Navigation items
  const navItems: NavItem[] = [
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
      icon: 'AddCircle', 
      label: 'Register', 
      to: '/register-stall',
      iconActive: (path: string) => path === '/register-stall' || path.startsWith('/register-stall/'),
      studentOnly: true,
    },
    { 
      icon: 'People', 
      label: 'Organizers', 
      to: '/organizers',
      iconActive: (path: string) => path === '/organizers' || path.startsWith('/organizers/'),
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
    // Admin only items
    { 
      icon: 'Category', 
      label: 'Dashboard', 
      to: '/admin/dashboard',
      iconActive: (path: string) => 
        path === '/admin' || path === '/admin/' || path === '/admin/dashboard' ||
        path.startsWith('/admin/dashboard/'),
      adminOnly: true,
    },
    { 
      icon: 'Setting', 
      label: 'Manage Stalls', 
      to: '/admin/stalls',
      iconActive: (path: string) => 
        path === '/admin/stalls' || path.startsWith('/admin/stalls/'),
      adminOnly: true,
    },
    { 
      icon: 'DocumentText', 
      label: 'Forms', 
      to: '/admin/forms',
      iconActive: (path: string) => 
        path === '/admin/forms' || path.startsWith('/admin/forms/'),
      adminOnly: true,
    },
    { 
      icon: 'MessageText1', 
      label: 'Messages', 
      to: '/admin/contact-submissions',
      iconActive: (path: string) => 
        path === '/admin/contact-submissions' || path.startsWith('/admin/contact-submissions/'),
      adminOnly: true,
    },
    { 
      icon: 'User', 
      label: 'Profile', 
      to: '/profile',
      iconActive: (path: string) => path === '/profile' || path.startsWith('/profile/'),
    },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin && !isJuniorAdmin) return false;
    if (item.studentOnly && (isAdmin || isJuniorAdmin)) return false;
    return true;
  });

  // Bottom navigation items (only show main sections)
  const bottomNavItems = filteredNavItems.filter(item => 
    ['/home', '/events', '/stalls', '/profile'].includes(item.to) ||
    (isAdmin && item.to === '/admin/dashboard')
  ).slice(0, 4); // Limit to 4 items for bottom nav

  // Check if current path is active
  const isActive = (item: NavItem) => {
    if (item.iconActive) {
      return item.iconActive(activePath);
    }
    return activePath === item.to || activePath.startsWith(`${item.to}/`);
  };

  return (
    <>
      {/* Top App Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-50 h-14 flex items-center px-4">
        {/* Hamburger Menu Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <IconsaxIcon name="Menu" className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          
          {/* Sidebar Content */}
          <SheetContent side="left" className="w-72 p-0">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between bg-primary text-primary-foreground">
                <h2 className="text-xl font-bold">Kala Kranti</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                  className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                >
                  <IconsaxIcon name="CloseSquare" className="h-5 w-5" />
                </Button>
              </div>
              
              {/* User Profile */}
              <div className="p-4 border-b flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {profile?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile?.email || 'user@example.com'}</p>
                </div>
              </div>
              
              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto py-2">
                <div className="space-y-1 px-2">
                  {filteredNavItems.map((item) => {
                    const active = isActive(item);
                    return (
                      <Button
                        key={item.to}
                        variant={active ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-3',
                          active ? 'bg-accent text-accent-foreground' : ''
                        )}
                        onClick={() => {
                          navigate(item.to);
                          setIsOpen(false);
                        }}
                      >
                        <IconsaxIcon 
                          name={item.icon} 
                          variant={active ? 'Bold' : 'Linear'}
                          className={cn(
                            'h-5 w-5 mr-3',
                            active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                          )} 
                        />
                        <span>{item.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </nav>
              
              {/* Footer */}
              <div className="p-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                >
                  <IconsaxIcon name="Logout" variant="Bold" className="h-5 w-5 mr-3 text-destructive" />
                  Sign Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* App Title */}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold">
            {isAdmin || isJuniorAdmin ? 'Admin Panel' : 'Kala Kranti'}
          </h1>
        </div>
        
        {/* User Avatar */}
        <div className="w-10 flex justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => navigate('/profile')}
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
          </Button>
        </div>
      </header>
      
      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
        <div className="flex items-center justify-around h-16">
          {bottomNavItems.map((item) => {
            const active = isActive(item);
            return (
              <Button
                key={item.to}
                variant="ghost"
                size="sm"
                className={cn(
                  'flex flex-col h-full rounded-none w-full',
                  'text-xs font-medium',
                  active ? 'text-primary' : 'text-muted-foreground',
                  'hover:bg-transparent hover:text-primary'
                )}
                onClick={() => navigate(item.to)}
              >
                <item.icon className={cn('h-5 w-5 mb-1', active ? 'fill-current' : '')} />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
      
      {/* Add padding to the top and bottom of the main content to account for fixed headers */}
      <div className="md:hidden h-14"></div>
      <div className="md:hidden h-16"></div>
    </>
  );
}
