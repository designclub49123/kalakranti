import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Award, ArrowRight, BarChart3, FileText, Clock, CheckCircle, Loader2, MapPin, Mail, Phone, FolderOpen, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface Event {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  registration_open: boolean;
  location: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Stall {
  id: string;
  event_id: string;
  event_name: string;
  stall_number: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  event_date: string;
  location: string;
  user_name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
}

interface Stats {
  total_events: number;
  pending_registrations: number;
  approved_stalls: number;
  certificates_issued: number;
}

interface Stat {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  href?: string;
}

export default function Home() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [pendingStalls, setPendingStalls] = useState<Stall[]>([]);
  const [approvedStalls, setApprovedStalls] = useState<Stall[]>([]);
  const [totalStalls, setTotalStalls] = useState(0);
  const [stats, setStats] = useState<Stats>({
    total_events: 0,
    pending_registrations: 0,
    approved_stalls: 0,
    certificates_issued: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          await Promise.all([
            fetchDashboardData(),
            fetchStats()
          ]);
        } else {
          await fetchEvents();
        }
      } catch (error) {
        console.error('', error);
        toast({
          
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch events
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true })
        .limit(3);

      if (eventError) throw eventError;

      // For students, show all approved stalls
      const { data: allStalls, error: stallsError } = await supabase
        .from('stalls')
        .select(`
          *,
          events:event_id (id, name, start_date, location),
          leader:leader_id (id, full_name, email, phone)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (stallsError) throw stallsError;

      console.log('Fetched stalls:', allStalls); // Debug log

      // Format the stalls data
      const formattedStalls = (allStalls || []).map(stall => {
        const event = Array.isArray(stall.events) ? stall.events[0] : stall.events;
        const leader = Array.isArray(stall.leader) ? stall.leader[0] : stall.leader;
        
        return {
          id: stall.id,
          event_id: stall.event_id,
          event_name: event?.name || 'Unknown Event',
          stall_number: stall.stall_number ? `#${stall.stall_number}` : 'TBD',
          status: stall.status,
          created_at: stall.created_at,
          updated_at: stall.updated_at,
          event_date: event?.start_date 
            ? format(new Date(event.start_date), 'MMM dd, yyyy') 
            : 'Date not set',
          location: event?.location || 'Location not specified',
          user_name: leader?.full_name || 'Unknown User',
          description: stall.description,
          contact_email: leader?.email,
          contact_phone: leader?.phone
        };
      });

      console.log('Formatted stalls:', formattedStalls); // Debug log

      // For students, only show approved stalls
      const approved = formattedStalls.filter(stall => stall.status === 'approved');
      const pending = []; // Students don't see pending stalls

      console.log('Approved stalls:', approved); // Debug log

      setEvents(eventData || []);
      setStalls(approved); // Only show approved stalls
      setPendingStalls(pending);
      setApprovedStalls(approved);
      setTotalStalls(approved.length);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please try again.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('registration_open', true)
        .order('start_date', { ascending: true })
        .limit(3);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  };

  const fetchStats = async () => {
    try {
      // Get total events
      const { count: totalEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      // Get user's pending registrations
      const { count: pendingRegistrations } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'pending');

      // Get user's approved stalls
      const { count: approvedStalls } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'approved');

      // Get user's certificates count (assuming there's a certificates table)
      const { count: certificatesIssued } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      setStats({
        total_events: totalEvents || 0,
        pending_registrations: pendingRegistrations || 0,
        approved_stalls: approvedStalls || 0,
        certificates_issued: certificatesIssued || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Quick action buttons
  const quickActions = [
    {
      label: 'Events',
      icon: <Calendar className="h-5 w-5" />,
      href: '/events',
      description: 'Browse and join upcoming events'
    },
    {
      label: 'All Stalls',
      icon: <CheckCircle className="h-5 w-5" />,
      href: '/stalls',
      description: `View all ${totalStalls} stalls`
    },
    {
      label: 'Register Stall',
      icon: <FileText className="h-5 w-5" />,
      href: '/register-stall',
      description: 'Register a new stall'
    },
    {
      label: 'Profile',
      icon: <Users className="h-5 w-5" />,
      href: '/profile',
      description: 'View and edit your profile'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8 space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email || 'User'}!
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
          <Button asChild>
            <Link to="/profile">
              View Profile <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {user ? (
        <>
          {/* Stats Overview */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{events.length}</p>
                    <p className="text-sm text-muted-foreground">Total Events</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild className="mt-4 w-full">
                  <Link to="/events">View Events</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{approvedStalls.length}</p>
                    <p className="text-sm text-muted-foreground">Approved Stalls</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild className="mt-4 w-full">
                  <Link to="/stalls?status=approved">View Approved</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{pendingStalls.length}</p>
                    <p className="text-sm text-muted-foreground">Pending Stalls</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild className="mt-4 w-full">
                  <Link to="/stalls?status=pending">View Pending</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{totalStalls}</p>
                    <p className="text-sm text-muted-foreground">Total Stalls</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild className="mt-4 w-full">
                  <Link to="/stalls">View All Stalls</Link>
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* All Stalls */}
          

          {/* Upcoming Events */}
          {events.length > 0 && (
            <section>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Upcoming Events</CardTitle>
                  <Button variant="outline" asChild>
                    <Link to="/events">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {events.map((event) => (
                      <Card key={event.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{event.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(event.start_date), 'MMM dd, yyyy')} - {format(new Date(event.end_date), 'MMM dd, yyyy')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {event.description || 'No description available'}
                          </p>
                          <Button asChild className="w-full" variant="secondary">
                            <Link to={`/events/${event.id}`}>Register Now</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Quick Actions */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Quickly access important sections</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Button 
                    key={index} 
                    asChild 
                    variant="outline" 
                    className="h-auto py-4 px-4 justify-start hover:bg-accent/50 transition-colors"
                  >
                    <Link to={action.href} className="flex flex-col items-start gap-2 text-left w-full">
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-primary/10 text-primary">
                          {action.icon}
                        </span>
                        <span className="font-medium">{action.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground text-left">
                        {action.description}
                      </p>
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </section>
        </>
      ) : (
        <>
          
          {/* Enhanced Features Section */}
          <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/10">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <Badge variant="outline" className="mb-4 py-1.5 px-4 border-primary/30 text-primary hover:bg-primary/5">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Why Choose EventStall Hub?
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 mb-4">
                  Elevate Your Event Experience
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Everything you need to manage your event stalls in one powerful platform
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <motion.div 
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Card className="relative h-full border-2 hover:border-primary/30 transition-all duration-300 overflow-hidden">
                    <CardHeader className="pb-0">
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-2xl mb-2">Easy Registration</CardTitle>
                      <CardDescription className="text-base">
                        Register your stall in minutes with our streamlined application process
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-4 pt-4 border-t border-border/50">
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                          <span>One-click application</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                          <span>Instant confirmation</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                          <span>Document upload</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Feature 2 */}
                <motion.div 
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Card className="relative h-full border-2 hover:border-blue-300/30 transition-all duration-300 overflow-hidden">
                    <CardHeader className="pb-0">
                      <div className="w-16 h-16 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                        <Calendar className="h-8 w-8 text-blue-500" />
                      </div>
                      <CardTitle className="text-2xl mb-2">Event Management</CardTitle>
                      <CardDescription className="text-base">
                        Browse and register for multiple events with automatic stall assignment
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-4 pt-4 border-t border-border/50">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Upcoming Events</span>
                          <Badge variant="outline" className="text-blue-500 border-blue-500/30">
                            12+
                          </Badge>
                        </div>
                        <Progress value={75} className="h-2 bg-blue-500/10" indicatorClassName="bg-blue-500" />
                        <p className="text-xs text-muted-foreground">
                          Book early for best stall locations
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Feature 3 */}
                <motion.div 
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Card className="relative h-full border-2 hover:border-amber-300/30 transition-all duration-300 overflow-hidden">
                    <CardHeader className="pb-0">
                      <div className="w-16 h-16 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
                        <Award className="h-8 w-8 text-amber-500" />
                      </div>
                      <CardTitle className="text-2xl mb-2">Digital Certificates</CardTitle>
                      <CardDescription className="text-base">
                        Receive verified certificates for your participation automatically
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-lg bg-amber-500/10">
                          <FileText className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-medium">Certificate of Participation</p>
                          <p className="text-sm text-muted-foreground">Download after event completion</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Stats Section */}
              <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-6 rounded-xl bg-background border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">500+</div>
                  <p className="text-sm text-muted-foreground mt-2">Active Events</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-background border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">10K+</div>
                  <p className="text-sm text-muted-foreground mt-2">Stalls Booked</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-background border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">98%</div>
                  <p className="text-sm text-muted-foreground mt-2">Satisfaction Rate</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-background border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">24/7</div>
                  <p className="text-sm text-muted-foreground mt-2">Support</p>
                </div>
              </div>
            </div>
          </section>

          
        </>
      )}
    </div>
  );
}