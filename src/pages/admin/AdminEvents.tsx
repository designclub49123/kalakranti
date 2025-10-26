import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
// Import Iconsax icons
import { Calendar1, Add, Edit, Trash, People } from 'iconsax-react';

interface Event {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  registration_open: boolean;
  created_at: string;
}

export default function AdminEvents() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    registration_open: true,
  });

  useEffect(() => {
    if (isAdmin) {
      fetchEvents();
    }
  }, [isAdmin]);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name.trim() || new Date(formData.start_date) > new Date(formData.end_date)) {
      toast({
        title: 'Error',
        description: 'Please ensure all fields are valid and end date is after start date.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update({
            name: formData.name,
            description: formData.description,
            start_date: formData.start_date,
            end_date: formData.end_date,
            registration_open: formData.registration_open,
          })
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Event updated successfully' });
      } else {
        const { error } = await supabase
          .from('events')
          .insert({
            name: formData.name,
            description: formData.description,
            start_date: formData.start_date,
            end_date: formData.end_date,
            registration_open: formData.registration_open,
            created_by: user.id,
          });

        if (error) throw error;
        toast({ title: 'Success', description: 'Event created successfully' });
      }

      setOpen(false);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || '',
      start_date: event.start_date,
      end_date: event.end_date,
      registration_open: event.registration_open,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Success', description: 'Event deleted successfully' });
      fetchEvents();
    }
  };

  const toggleRegistration = async (event: Event) => {
    const { error } = await supabase
      .from('events')
      .update({ registration_open: !event.registration_open })
      .eq('id', event.id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: `Registration ${event.registration_open ? 'closed' : 'opened'} successfully`,
      });
      fetchEvents();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      registration_open: true,
    });
    setEditingEvent(null);
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-2 text-destructive">Access Denied</h2>
        <p className="text-sm md:text-base text-muted-foreground">You don't have permission to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
        <div className="h-6 w-6 md:h-8 md:w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 space-y-6 pb-10 md:pb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Manage Events</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Create and manage events for stall registrations
          </p>
        </div>
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Add className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-[90vw] sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter event name"
                  required
                  className="text-base md:text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description (optional)..."
                  rows={3}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="registration_open" className="text-sm font-medium">
                  Allow Registrations
                </Label>
                <Switch
                  id="registration_open"
                  checked={formData.registration_open}
                  onCheckedChange={(checked) => setFormData({ ...formData, registration_open: checked })}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="py-12 md:py-16 text-center">
            <Calendar1 className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">No events yet</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-6">
              Create your first event to start accepting stall registrations
            </p>
            <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
              <Add className="mr-2 h-4 w-4" />
              Create First Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base md:text-lg line-clamp-1">{event.name}</CardTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <CardDescription className="text-xs">
                        {format(new Date(event.start_date), 'MMM dd, yyyy')} -{' '}
                        {format(new Date(event.end_date), 'MMM dd, yyyy')}
                      </CardDescription>
                      <Badge variant="outline" className="text-xs">
                        Created {format(new Date(event.created_at), 'MMM dd')}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant={event.registration_open ? 'default' : 'secondary'}>
                    {event.registration_open ? 'Open' : 'Closed'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-4">
                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                )}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => (window.location.href = `/admin/events/${event.id}/registrations`)}
                  >
                    <People className="mr-1 h-3 w-3" />
                    Registrations
                  </Button>
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <Switch
                      checked={event.registration_open}
                      onCheckedChange={() => toggleRegistration(event)}
                      aria-label="Toggle registration"
                    />
                    <span className="text-xs font-medium">
                      {event.registration_open ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                    <Trash className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}