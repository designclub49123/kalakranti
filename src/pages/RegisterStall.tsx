import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X, Calendar, User, Users, Phone, Mail, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Event {
  id: string;
  name: string;
  registration_open: boolean;
  start_date: string;
  end_date: string;
}

export default function RegisterStall() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_id: '',
    phone: '',
    members: ['']
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('id, name, registration_open, start_date, end_date')
      .eq('registration_open', true)
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true });

    if (data) setEvents(data);
  };

  const addMember = () => {
    if (formData.members.length < 4) { // Max 4 additional members + leader = 5 total
      setFormData({ ...formData, members: [...formData.members, ''] });
    }
  };

  const removeMember = (index: number) => {
    const newMembers = formData.members.filter((_, i) => i !== index);
    setFormData({ ...formData, members: newMembers });
  };

  const updateMember = (index: number, value: string) => {
    const newMembers = [...formData.members];
    newMembers[index] = value;
    setFormData({ ...formData, members: newMembers });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Validate members emails
      const memberEmails = formData.members.filter(m => m.trim());
      const uniqueEmails = new Set(memberEmails);
      
      if (memberEmails.length !== uniqueEmails.size) {
        toast({
          title: 'Error',
          description: 'Member emails must be unique',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      // Check if members exist as users
      const memberIds: string[] = [];
      for (const email of memberEmails) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email.trim())
          .single();
        
        if (error || !data) {
          toast({
            title: 'Error',
            description: `Member with email ${email} not found. Please ensure they have an account.`,
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
        
        if (data.id === user.id) {
          toast({
            title: 'Error',
            description: 'You cannot add yourself as a team member.',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
        
        memberIds.push(data.id);
      }

      // Update leader's phone number
      await supabase
        .from('profiles')
        .update({ phone: formData.phone })
        .eq('id', user.id);

      const { error } = await supabase
        .from('stalls')
        .insert({
          name: formData.name,
          description: formData.description,
          event_id: formData.event_id,
          leader_id: user.id,
          members: memberIds,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Stall registration submitted! Awaiting approval.',
        variant: 'default'
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (events.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <Card>
          <CardHeader className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>No Open Events</CardTitle>
            <CardDescription>
              There are no events currently accepting registrations. Check back later!
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedEvent = events.find(e => e.id === formData.event_id);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 pb-20 md:pb-8">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Register Your Stall</CardTitle>
          </div>
          <CardDescription className="text-center md:text-left">
            Fill in the details below to register your stall for an upcoming event. 
            Ensure all team members have active accounts.
          </CardDescription>
          {selectedEvent && (
            <Badge variant="secondary" className="mt-2 ml-auto w-fit">
              <Calendar className="h-3 w-3 mr-1" />
              Selected: {selectedEvent.name} ({new Date(selectedEvent.start_date).toLocaleDateString()} - {new Date(selectedEvent.end_date).toLocaleDateString()})
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Event Selection - Full Width */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="event" className="text-base font-medium">Select Event *</Label>
              </div>
              <Select
                value={formData.event_id}
                onValueChange={(value) => setFormData({ ...formData, event_id: value })}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose an event to register for" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name} ({new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stall Details - Grid Layout */}
            <div className="grid md:grid-cols-2 gap-6 p-6 border rounded-lg bg-muted/50">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 col-span-full">
                  <FileText className="h-4 w-4" />
                  Stall Details
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="name">Stall Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Tech Innovations Stall"
                    required
                    maxLength={100}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Stall Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Briefly describe your stall's concept, products, or services (optional, max 500 characters)"
                    rows={4}
                    className="min-h-[120px]"
                    maxLength={500}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Description (optional)</span>
                    <span>{formData.description.length}/500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information - Grid Layout */}
            <div className="grid md:grid-cols-2 gap-6 p-6 border rounded-lg bg-muted/50">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 col-span-full">
                  <Phone className="h-4 w-4" />
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="phone">Team Leader Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g., 1234567890"
                    required
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit phone number"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span>10-digit number required for contact</span>
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Team Leader</Label>
                  <div className="flex items-center gap-2 p-3 bg-background rounded-md border">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{profile?.email || user?.email || 'Your Email'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You are automatically the team leader.
                  </p>
                </div>
              </div>
            </div>

            {/* Team Members - Full Width with Internal Grid */}
            <div className="p-6 border rounded-lg bg-muted/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <Label className="text-base font-medium">Team Members (Emails)</Label>
                </div>
                <Badge variant="outline" className="text-xs">
                  Max 4 additional members (5 total including leader)
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Add emails of team members who have accounts on the platform. They will be notified.
              </p>
              <div className="space-y-3">
                {formData.members.map((member, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        value={member}
                        onChange={(e) => updateMember(index, e.target.value)}
                        placeholder={`Member ${index + 1} email`}
                        type="email"
                        className="flex-1"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMember(index)}
                      disabled={formData.members.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {formData.members.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMember}
                  className="w-full mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Member
                </Button>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full max-w-md mx-auto" 
              disabled={loading || !formData.event_id || !formData.name || !formData.phone}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Stall Registration
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}