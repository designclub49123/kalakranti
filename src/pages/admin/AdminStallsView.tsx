import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, Download, Users, Mail, Phone, Activity, FileText } from 'lucide-react';

interface Event {
  id: string;
  name: string;
}

interface Stall {
  id: string;
  name: string;
  description: string | null;
  stall_number: number;
  status: string;
  leader: {
    full_name: string;
    email: string;
    phone: string | null;
  } | null;
  members: string[];
  memberProfiles?: Array<{
    full_name: string;
    email: string;
    phone: string | null;
  }>;
}

export default function AdminStallsView() {
  const { isAdmin, isJuniorAdmin } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin || isJuniorAdmin) {
      fetchEvents();
    }
  }, [isAdmin, isJuniorAdmin]);

  useEffect(() => {
    if (selectedEvent) {
      fetchStalls();
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('id, name')
      .order('start_date', { ascending: false });

    if (data) {
      setEvents(data);
      if (data.length > 0) setSelectedEvent(data[0].id);
    }
    setLoading(false);
  };

  const fetchStalls = async () => {
    if (!selectedEvent) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('stalls')
      .select(`
        *,
        leader:profiles!leader_id(full_name, email, phone)
      `)
      .eq('event_id', selectedEvent)
      .order('stall_number', { ascending: true });

    if (!error && data) {
      // Fetch member profiles for each stall
      const stallsWithMembers = await Promise.all(
        data.map(async (stall) => {
          if (stall.members && stall.members.length > 0) {
            const { data: memberData } = await supabase
              .from('profiles')
              .select('full_name, email, phone')
              .in('id', stall.members);
            
            return { ...stall, memberProfiles: memberData || [] };
          }
          return { ...stall, memberProfiles: [] };
        })
      );
      setStalls(stallsWithMembers);
    }
    setLoading(false);
  };

  const exportToPDF = () => {
    const event = events.find(e => e.id === selectedEvent);
    const data = stalls.map(stall => ({
      'Stall Number': stall.stall_number || 'Pending',
      'Stall Name': stall.name,
      'Status': stall.status,
      'Leader': stall.leader?.full_name,
      'Leader Email': stall.leader?.email,
      'Leader Phone': stall.leader?.phone || 'N/A',
      'Members': stall.memberProfiles?.map(m => m.full_name).join(', ') || 'None',
      'Description': stall.description || 'N/A'
    }));

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event?.name || 'event'}_stalls.csv`;
    a.click();

    toast({
      title: 'Success',
      description: 'Stalls data exported successfully'
    });
  };

  if (!isAdmin && !isJuniorAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center space-y-4">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] pt-20">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-20 pb-20 md:pt-8 md:pb-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">View All Stalls</h1>
            <p className="text-muted-foreground">
              View detailed information about stalls by event
            </p>
          </div>
        </div>
        {stalls.length > 0 && (
          <Button onClick={exportToPDF} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Select Event
          </CardTitle>
          <CardDescription>Choose an event to view its stalls</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {stalls.length === 0 ? (
        <Card className="border-0 bg-gradient-to-br from-muted/50 to-muted/30">
          <CardContent className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-6 mx-auto">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold mb-2">No stalls found</CardTitle>
            <CardDescription className="text-lg">
              No stalls registered for this event yet
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {stalls.map((stall) => (
            <Collapsible key={stall.id}>
              <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/10 transition-colors p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant={stall.status === 'approved' ? 'default' : 'secondary'} 
                          className="text-lg px-4 py-2 bg-gradient-to-r from-primary to-secondary"
                        >
                          {stall.stall_number ? `#${stall.stall_number}` : 'Pending'}
                        </Badge>
                        <div className="text-left space-y-1">
                          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                            {stall.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            Status: <Badge variant="outline" className="text-xs">{stall.status}</Badge> | 
                            Leader: <span className="font-medium">{stall.leader?.full_name}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t border-border/50">
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                        <Users className="h-4 w-4" />
                        Team Leader Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Name:</span>
                          <span className="text-foreground">{stall.leader?.full_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Email:</span>
                          <span className="text-foreground">{stall.leader?.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Phone:</span>
                          <span className="text-foreground">{stall.leader?.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {stall.memberProfiles && stall.memberProfiles.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                          <Users className="h-4 w-4" />
                          Team Members ({stall.memberProfiles.length})
                        </h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {stall.memberProfiles.map((member, idx) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-foreground">{member.full_name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-foreground">{member.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-foreground">{member.phone || 'N/A'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {stall.description && (
                      <div className="space-y-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                          Description
                        </h4>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground leading-relaxed">{stall.description}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}