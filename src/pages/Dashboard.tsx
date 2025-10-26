import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Store, Award, Clock, CheckCircle, Calendar, Plus, FileText, HelpCircle, Bell, Search, ChevronRight, Activity, Users as UsersIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface Event {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  banner_url?: string;
}

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myStalls, setMyStalls] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    totalStalls: 0,
    approvedStalls: 0,
    pendingStalls: 0,
    certificates: 0,
    completion: 75, // Profile completion percentage
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchUpcomingEvents();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const [stallsResult, certsResult] = await Promise.all([
        supabase
          .from('stalls')
          .select('*, event:events(name, start_date, end_date)')
          .or(`leader_id.eq.${user.id},members.cs.{${user.id}}`),
        supabase
          .from('certificates')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
      ]);

      if (stallsResult.data) {
        const sortedStalls = [...stallsResult.data].sort((a, b) => 
          new Date(b.event?.start_date || 0).getTime() - new Date(a.event?.start_date || 0).getTime()
        );
        
        setMyStalls(sortedStalls);
        setStats(prev => ({
          ...prev,
          totalStalls: stallsResult.count || 0,
          approvedStalls: stallsResult.data.filter(s => s.status === 'approved').length,
          pendingStalls: stallsResult.data.filter(s => s.status === 'pending').length,
        }));
      }

      if (certsResult.data) {
        setStats(prev => ({
          ...prev,
          certificates: certsResult.count || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(3);

      if (events) {
        setUpcomingEvents(events);
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] pt-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Stalls',
      value: stats.totalStalls,
      icon: Store,
      description: 'All registrations',
      color: 'bg-primary/10',
      textColor: 'text-primary'
    },
    {
      title: 'Approved',
      value: stats.approvedStalls,
      icon: CheckCircle,
      description: 'Approved stalls',
      color: 'bg-green-500/10',
      textColor: 'text-green-500'
    },
    {
      title: 'Pending',
      value: stats.pendingStalls,
      icon: Clock,
      description: 'Awaiting approval',
      color: 'bg-amber-500/10',
      textColor: 'text-amber-500'
    },
    {
      title: 'Certificates',
      value: stats.certificates,
      icon: Award,
      description: 'Earned certificates',
      color: 'bg-secondary/10',
      textColor: 'text-secondary'
    },
  ];

  const quickActions = [
    { 
      title: 'Register New Stall', 
      icon: Plus,
      description: 'Apply for a new stall in upcoming events',
      action: '/events'
    },
    { 
      title: 'View Certificates', 
      icon: FileText,
      description: 'Access your earned certificates',
      action: '/certificates'
    },
    { 
      title: 'Help Center', 
      icon: HelpCircle,
      description: 'Get help with your account and events',
      action: '/help'
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-20 md:pt-8 md:pb-8">
      {/* Header */}
      <div className="bg-card border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {profile?.full_name || 'Student'}! Here's what's happening today.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Get things done quickly</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      className="h-24 flex flex-col items-center justify-center p-4 text-center hover:bg-primary/5 transition-colors group border-0"
                      asChild
                    >
                      <Link to={action.action} className="space-y-2">
                        <action.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-foreground">{action.title}</span>
                        <p className="text-xs text-muted-foreground line-clamp-2">{action.description}</p>
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* My Stalls */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    My Stalls
                  </CardTitle>
                  <CardDescription>Your registered stalls and their status</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-8 px-3">
                  <Link to="/my-stalls">View All</Link>
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                {myStalls.length > 0 ? (
                  <div className="space-y-3">
                    {myStalls.slice(0, 3).map((stall) => (
                      <div 
                        key={stall.id} 
                        className="group flex items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Store className="h-6 w-6 text-primary" />
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">{stall.name}</p>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <span className="truncate">{stall.event?.name}</span>
                            {stall.event?.start_date && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{format(new Date(stall.event.start_date), 'MMM d, yyyy')}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={stall.status === 'approved' ? 'default' : stall.status === 'pending' ? 'secondary' : 'destructive'}
                          className="ml-auto whitespace-nowrap"
                        >
                          {stall.status === 'approved' && stall.stall_number 
                            ? `#${stall.stall_number} - Approved` 
                            : stall.status.charAt(0).toUpperCase() + stall.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                      <Store className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No stalls yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Get started by registering for an event.
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/events">
                        <Plus className="mr-2 h-4 w-4" />
                        Register Stall
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" />
                  Profile Completion
                </CardTitle>
                <CardDescription>Complete your profile to unlock all features</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">Profile Strength</span>
                    <span className="text-primary">{stats.completion}%</span>
                  </div>
                  <Progress value={stats.completion} className="h-2" indicatorClassName="bg-primary" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Basic Information</span>
                  </div>
                  <div className="flex items-center text-sm text-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Contact Details</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
                    <span>Add Profile Picture</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/profile">Complete Profile</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events
                  </CardTitle>
                  <CardDescription>Events you might be interested in</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-8 px-3">
                  <Link to="/events">View All</Link>
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="group cursor-pointer">
                        <div className="flex items-start p-4 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary font-bold text-sm leading-none">
                            <span className="text-lg -mt-1">
                              {format(new Date(event.start_date), 'd')}
                            </span>
                            <span className="text-xs">
                              {format(new Date(event.start_date), 'MMM')}
                            </span>
                          </div>
                          <div className="ml-4 flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                              {event.name}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{format(new Date(event.start_date), 'MMM d, yyyy')}</span>
                              {event.location && (
                                <>
                                  <span className="mx-1">•</span>
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span className="truncate">{event.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors ml-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
                    <p className="text-muted-foreground mb-6">
                      Check back later for new events.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}