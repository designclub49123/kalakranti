import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shop, Medal, Calendar1, UserSquare, Clock, Check, Document, Message, Activity as ActivityIcon, User, Setting, Chart } from 'iconsax-react';

export default function AdminDashboard() {
  const { profile, isAdmin, isJuniorAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStalls: 0,
    pendingStalls: 0,
    approvedStalls: 0,
    rejectedStalls: 0,
    totalEvents: 0,
    activeEvents: 0,
    totalCertificates: 0,
    totalUsers: 0,
    totalForms: 0,
    contactSubmissions: 0
  });

  useEffect(() => {
    if (isAdmin || isJuniorAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin, isJuniorAdmin]);

  const fetchDashboardData = async () => {
    try {
      const [
        { data: stallsData, count: totalStalls },
        { data: eventsData, count: totalEvents },
        { count: totalCertificates },
        { count: totalUsers },
        { count: totalForms },
        { count: contactSubmissions }
      ] = await Promise.all([
        supabase.from('stalls').select('status', { count: 'exact' }),
        supabase.from('events').select('registration_open', { count: 'exact' }),
        (supabase as any).from('certificates').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        (supabase as any).from('forms').select('*', { count: 'exact', head: true }),
        (supabase as any).from('contact_submissions').select('*', { count: 'exact', head: true })
      ]);

      const pendingStalls = stallsData?.filter(s => s.status === 'pending').length || 0;
      const approvedStalls = stallsData?.filter(s => s.status === 'approved').length || 0;
      const rejectedStalls = stallsData?.filter(s => s.status === 'rejected').length || 0;
      const activeEvents = eventsData?.filter(e => e.registration_open).length || 0;

      setStats({
        totalStalls: totalStalls || 0,
        pendingStalls,
        approvedStalls,
        rejectedStalls,
        totalEvents: totalEvents || 0,
        activeEvents,
        totalCertificates: totalCertificates || 0,
        totalUsers: totalUsers || 0,
        totalForms: totalForms || 0,
        contactSubmissions: contactSubmissions || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-lg border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isJuniorAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <User size={48} color="currentColor" variant="Linear" className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-destructive">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You don't have permission to view this page.</p>
          <Button asChild className="rounded-lg">
            <Link to="/home">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Review Stalls',
      description: `${stats.pendingStalls} pending approval`,
      icon: Clock,
      link: '/admin/stalls',
      color: 'text-orange-500 bg-orange-500/10',
      badge: stats.pendingStalls > 0 ? <Badge variant="destructive" className="absolute top-4 right-4">{stats.pendingStalls}</Badge> : null
    },
    {
      title: 'Create Event',
      description: 'Set up a new event',
      icon: Calendar1,
      link: '/admin/events',
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      title: 'Generate Certificates',
      description: 'Issue certificates',
      icon: Medal,
      link: '/admin/certificates',
      color: 'text-purple-500 bg-purple-500/10'
    },
    {
      title: 'Send Communications',
      description: 'Notify participants',
      icon: Message,
      link: '/admin/communications',
      color: 'text-green-500 bg-green-500/10'
    }
  ];

  const statCards = [
    {
      title: 'Total Stalls',
      value: stats.totalStalls,
      icon: Shop,
      description: `${stats.approvedStalls} approved • ${stats.pendingStalls} pending • ${stats.rejectedStalls} rejected`,
      link: '/admin/stalls',
      trend: stats.pendingStalls > 0 ? '+2%' : '0%'
    },
    {
      title: 'Events',
      value: stats.totalEvents,
      icon: Calendar1,
      description: `${stats.activeEvents} active`,
      link: '/admin/events',
      trend: '+5%'
    },
    {
      title: 'Certificates',
      value: stats.totalCertificates,
      icon: Medal,
      description: 'Total issued',
      link: '/admin/certificates',
      trend: '+12%'
    },
    {
      title: 'Users',
      value: stats.totalUsers,
      icon: UserSquare,
      description: 'Registered participants',
      link: '/admin/users',
      trend: '+8%'
    },
    {
      title: 'Forms',
      value: stats.totalForms,
      icon: Document,
      description: 'Custom forms created',
      link: '/admin/forms',
      trend: '0%'
    },
    {
      title: 'Contact Messages',
      value: stats.contactSubmissions,
      icon: Message,
      description: 'New inquiries',
      link: '/admin/contact',
      trend: '+3%'
    }
  ];

  return (
    <div className="max-w-full mx-auto sm:max-w-none container mx-auto px-4 py-6 space-y-8">
      {/* Enhanced Header */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-2xl md:text-3xl lg:text-3xl">Admin Dashboard</h1>
            <p className="text-sm sm:text-sm md:text-sm lg:text-sm">
              Welcome back, <span className="font-semibold">{profile?.full_name || 'Admin'}</span>! Here’s what’s happening today.
            </p>
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 rounded-lg">
            <Link to="/admin/settings" className="flex items-center">
              <Setting size={16} color="white" variant="Linear" className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </Card>

      {/* Enhanced Alert Card */}
      {stats.pendingStalls > 0 && (
        <Card className="p-4 sm:p-0 bg-gradient-to-r from-orange-100 to-orange-200 border-l-4 border-orange-500 shadow-md animate-pulse rounded-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock size={20} color="currentColor" variant="Linear" className="h-5 w-5 text-orange-600 animate-pulse" />
              <CardTitle className="text-lg font-semibold">Action Required</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You have <Badge variant="destructive" className="ml-1 inline-flex items-center gap-1">
                <Clock size={12} color="currentColor" variant="Linear" className="h-3 w-3" />
                {stats.pendingStalls}
              </Badge> stall{stats.pendingStalls > 1 ? 's' : ''} waiting for approval.
            </p>
            <Button asChild className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white rounded-lg">
              <Link to="/admin/stalls?status=pending">Review Now</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Quick Actions */}
      <Card className="p-4 sm:p-0 overflow-hidden rounded-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Chart size={20} color="currentColor" variant="Linear" className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={action.title} to={action.link} className="group relative block h-full">
                <Card className={`h-56 flex items-center justify-center border-0 ${action.color} shadow-md hover:shadow-xl transition-all duration-300 hover:bg-gradient-to-br from-${action.color.split('-')[1]}-100 to-${action.color.split('-')[1]}-50 rounded-lg`}>
                  <div className="text-center p-6">
                    <action.icon size={60} color="currentColor" variant="Linear" className={`mx-auto mb-6 ${action.color.replace('bg-', 'text-')} group-hover:scale-110 transition-transform duration-200`} />
                    <h3 className="font-semibold text-xl mb-3">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  {action.badge}
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Enhanced Stats Overview */}
      <Card className="p-4 sm:p-0 overflow-hidden rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Chart size={20} color="currentColor" variant="Linear" className="h-5 w-5" />
              Overview Statistics
            </CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 rounded-lg">
            <ActivityIcon size={16} color="currentColor" variant="Linear" className="h-4 w-4 animate-pulse" />
            Updated now
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-6 overflow-x-auto">
            {statCards.map((stat) => (
              <Link key={stat.title} to={stat.link} className="group w-full sm:w-1/3 min-w-[250px]">
                <Card className="p-6 border-0 bg-gradient-to-b from-background to-muted/50 hover:shadow-lg transition-all duration-300 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <stat.icon size={20} color="currentColor" variant="Linear" className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <Badge variant="outline" className={`text-xs ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-muted-foreground'} rounded-lg`}>
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors animate-count-up" data-value={stat.value}>{stat.value}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{stat.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 sm:p-0 overflow-hidden rounded-lg">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Check size={20} color="currentColor" variant="Linear" className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {[
              { label: 'Database', status: 'Online', color: 'text-green-500' },
              { label: 'Storage', status: 'Online', color: 'text-green-500' },
              { label: 'Authentication', status: 'Online', color: 'text-green-500' }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 px-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <Badge variant="secondary" className={`${item.color} text-xs rounded-lg`}>{item.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-0 overflow-hidden rounded-lg">
          <CardHeader className="bg-blue-50 border-b border-blue-100">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Setting size={20} color="currentColor" variant="Linear" className="h-5 w-5" />
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-2">
            {[
              { label: 'Stall Management', link: '/admin/stalls', icon: Shop },
              { label: 'Event Management', link: '/admin/events', icon: Calendar1 },
              { label: 'User Management', link: '/admin/users', icon: UserSquare },
              { label: 'Form Builder', link: '/admin/forms', icon: Document }
            ].map((item) => (
              <Link key={item.label} to={item.link} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-all duration-200 text-sm group">
                <item.icon size={16} color="currentColor" variant="Linear" className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                <span className="font-medium">{item.label}</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <ActivityIcon size={12} color="currentColor" variant="Linear" className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-0 overflow-hidden rounded-lg">
          <CardHeader className="bg-purple-50 border-b border-purple-100">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <ActivityIcon size={20} color="currentColor" variant="Linear" className="h-5 w-5 animate-pulse" />
              Recent Activity
            </CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {[
              { text: 'New stall application received', time: '2 min ago' },
              { text: 'Event updated successfully', time: '1 hr ago' },
              { text: 'Certificate generated', time: '3 hrs ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <ActivityIcon size={16} color="currentColor" variant="Linear" className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{activity.text}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}