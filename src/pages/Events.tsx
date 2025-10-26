import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Calendar, People } from 'iconsax-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  registration_open: boolean;
}

export default function Events() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

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

  const isEventActive = (event: Event) => {
    const now = new Date();
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    return now >= start && now <= end;
  };

  const isEventUpcoming = (event: Event) => {
    return new Date(event.start_date) > new Date();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh] pt-10">
        <div className="h-6 w-6 md:h-8 md:w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 space-y-6 pt-10 pb-10 md:pt-8 md:pb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Events</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Browse and register for upcoming events
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 md:py-16 text-center">
            <Calendar className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-base md:text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Check back later for upcoming events
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {events.map((event) => {
            const active = isEventActive(event);
            const upcoming = isEventUpcoming(event);
            const status = active ? 'Active' : upcoming ? 'Upcoming' : 'Past';
            const statusVariant = active ? 'default' : upcoming ? 'secondary' : 'outline';

            return (
              <Card
                key={event.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50"
              >
                <CardHeader className="p-4 sm:p-6 pb-4">
                  <div className="flex flex-wrap gap-2 items-center mb-3">
                    <Badge
                      variant={statusVariant}
                      className={`text-xs md:text-sm ${active ? 'bg-green-500 hover:bg-green-600' : ''}`}
                    >
                      {status}
                    </Badge>
                    {event.registration_open && (
                      <Badge variant="default" className="text-xs md:text-sm">
                        Open for Registration
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base md:text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {event.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 pt-1 text-xs md:text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(event.start_date), 'MMM dd')} -{' '}
                      {format(new Date(event.end_date), 'MMM dd, yyyy')}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 p-4 sm:p-6 space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {event.description || 'No description available'}
                  </p>
                  {event.registration_open && profile && (
                    <Button
                      asChild
                      className="w-full group-hover:bg-primary/90 transition-colors text-sm md:text-base"
                      disabled={!upcoming && !active}
                    >
                      <Link to={`/events/${event.id}/register`}>
                        <People className="mr-2 h-4 w-4" />
                        Register Stall
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}