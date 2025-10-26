import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Search, Mail, Phone, ChevronRight } from 'lucide-react';

interface Event {
  id: string;
  name: string;
}

interface Stall {
  id: string;
  name: string;
  description: string | null;
  stall_number: number;
  event: {
    id: string;
    name: string;
  } | null;
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

export default function StallsNew() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [filteredStalls, setFilteredStalls] = useState<Stall[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchStalls();
  }, []);

  useEffect(() => {
    filterStalls();
  }, [search, selectedEvent, stalls]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('id, name')
      .order('start_date', { ascending: false });

    if (data) setEvents(data);
  };

  const fetchStalls = async () => {
    const { data, error } = await supabase
      .from('stalls')
      .select(`
        *,
        event:events(id, name),
        leader:profiles!leader_id(full_name, email, phone)
      `)
      .eq('status', 'approved')
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

  const filterStalls = () => {
    let filtered = stalls;

    // Filter by event
    if (selectedEvent && selectedEvent !== 'all') {
      filtered = filtered.filter(s => s.event?.id === selectedEvent);
    }

    // Filter by search
    if (search) {
      filtered = filtered.filter(
        (stall) =>
          stall.name.toLowerCase().includes(search.toLowerCase()) ||
          stall.event?.name.toLowerCase().includes(search.toLowerCase()) ||
          stall.leader?.full_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredStalls(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Approved Stalls</h1>
        <p className="text-muted-foreground">
          Browse all approved stalls across events
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by stall name, event, or team leader..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stalls Grid */}
      {filteredStalls.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-semibold mb-2">No stalls found</h3>
            <p className="text-muted-foreground">
              {search ? 'Try adjusting your search' : 'No approved stalls yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStalls.map((stall) => (
            <Card key={stall.id} className="hover:shadow-lg transition-base">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="default" className="text-lg px-3 py-1">
                    #{stall.stall_number}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-1">{stall.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  {stall.event?.name || 'Event'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {stall.description || 'No description available'}
                </p>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Led by {stall.leader?.full_name || 'Unknown'}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => setSelectedStall(stall)}
                >
                  View Details
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stall Details Dialog */}
      <Dialog open={!!selectedStall} onOpenChange={(open) => !open && setSelectedStall(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Badge variant="default" className="text-lg px-3 py-1">
                #{selectedStall?.stall_number}
              </Badge>
              {selectedStall?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedStall && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Event</p>
                <p>{selectedStall.event?.name}</p>
              </div>
              
              {selectedStall.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedStall.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Team Leader</p>
                <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedStall.leader?.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedStall.leader?.email}</span>
                  </div>
                  {selectedStall.leader?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedStall.leader.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedStall.memberProfiles && selectedStall.memberProfiles.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">Team Members</p>
                  <div className="space-y-2">
                    {selectedStall.memberProfiles.map((member, idx) => (
                      <div key={idx} className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{member.full_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{member.phone}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}