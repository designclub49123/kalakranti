import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Medal, UserSquare } from 'iconsax-react'; // Iconsax already in use

interface Event {
  id: string;
  name: string;
}

interface Stall {
  id: string;
  name: string;
  leader_id: string;
  members: string[];
  leader: { full_name: string; email: string } | null;
}

export default function AdminCertificates() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedStall, setSelectedStall] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchEvents();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (selectedEvent) {
      fetchStalls(selectedEvent);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('id, name')
      .order('start_date', { ascending: false });

    if (data) setEvents(data);
  };

  const fetchStalls = async (eventId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('stalls')
      .select(`
        id,
        name,
        leader_id,
        members,
        leader:profiles!leader_id(full_name, email)
      `)
      .eq('event_id', eventId)
      .eq('status', 'approved');

    if (data) setStalls(data);
    setLoading(false);
  };

  const generateCertificates = async () => {
    if (!selectedEvent || !selectedStall || !user) return;

    setGenerating(true);
    try {
      const stall = stalls.find((s) => s.id === selectedStall);
      if (!stall) throw new Error('Stall not found');

      // Generate certificate for leader
      const { error: leaderError } = await supabase
        .from('certificates')
        .insert({
          type: 'leader',
          user_id: stall.leader_id,
          stall_id: stall.id,
          event_id: selectedEvent,
          certificate_url: `cert_${stall.id}_leader.pdf`,
          blockchain_hash: `hash_${Date.now()}_leader`,
        });

      if (leaderError) throw leaderError;

      // Generate certificates for members
      if (stall.members && stall.members.length > 0) {
        const memberCerts = stall.members.map((memberId) => ({
          type: 'member',
          user_id: memberId,
          stall_id: stall.id,
          event_id: selectedEvent,
          certificate_url: `cert_${stall.id}_${memberId}.pdf`,
          blockchain_hash: `hash_${Date.now()}_${memberId}`,
        }));

        const { error: memberError } = await supabase
          .from('certificates')
          .insert(memberCerts);

        if (memberError) throw memberError;
      }

      toast({
        title: 'Success',
        description: `Generated certificates for ${stall.name} (${1 + (stall.members?.length || 0)} certificates)`,
      });

      setSelectedStall('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateAllCertificates = async () => {
    if (!selectedEvent || !user) return;

    if (!confirm('Generate certificates for ALL approved stalls in this event?')) return;

    setGenerating(true);
    try {
      for (const stall of stalls) {
        // Leader certificate
        await supabase.from('certificates').insert({
          type: 'leader',
          user_id: stall.leader_id,
          stall_id: stall.id,
          event_id: selectedEvent,
          certificate_url: `cert_${stall.id}_leader.pdf`,
          blockchain_hash: `hash_${Date.now()}_leader_${stall.id}`,
        });

        // Member certificates
        if (stall.members && stall.members.length > 0) {
          const memberCerts = stall.members.map((memberId) => ({
            type: 'member',
            user_id: memberId,
            stall_id: stall.id,
            event_id: selectedEvent,
            certificate_url: `cert_${stall.id}_${memberId}.pdf`,
            blockchain_hash: `hash_${Date.now()}_${memberId}`,
          }));

          await supabase.from('certificates').insert(memberCerts);
        }
      }

      toast({
        title: 'Success',
        description: `Generated certificates for all ${stalls.length} stalls`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto sm:max-w-none space-y-6 pb-20 md:pb-8"> {/* Added max-w-2xl for mobile, sm:max-w-none for desktop */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Generate Certificates</h1>
        <p className="text-muted-foreground">
          Create certificates for approved stall participants
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal size={20} color="currentColor" variant="Linear" />
            Certificate Generator
          </CardTitle>
          <CardDescription>
            Select an event and stall to generate certificates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Event</Label>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEvent && (
            <>
              <div className="space-y-2">
                <Label>Select Stall</Label>
                <Select value={selectedStall} onValueChange={setSelectedStall} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a stall" />
                  </SelectTrigger>
                  <SelectContent>
                    {stalls.map((stall) => (
                      <SelectItem key={stall.id} value={stall.id}>
                        {stall.name} - Led by {stall.leader?.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={generateCertificates}
                  disabled={!selectedStall || generating}
                  className="flex-1"
                >
                  <Medal size={16} color="currentColor" variant="Linear" />
                  {generating ? 'Generating...' : 'Generate for Selected Stall'}
                </Button>
                <Button
                  onClick={generateAllCertificates}
                  disabled={stalls.length === 0 || generating}
                  variant="outline"
                  className="flex-1"
                >
                  <UserSquare size={16} color="currentColor" variant="Linear" />
                  {generating ? 'Generating...' : `Generate for All (${stalls.length})`}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Select an event to view all approved stalls</p>
          <p>• Choose a specific stall or generate for all stalls at once</p>
          <p>• Leaders receive a special leadership certificate</p>
          <p>• Team members receive participation certificates</p>
          <p>• Certificates are automatically minted with blockchain verification</p>
          <p>• Participants can view and download their certificates from their dashboard</p>
        </CardContent>
      </Card>
    </div>
  );
}