import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { People, SearchNormal1 } from 'iconsax-react';

interface Stall {
  id: string;
  name: string;
  description: string | null;
  stall_number: number | null;
  event: {
    name: string;
  } | null;
  leader: {
    full_name: string | null;
  } | null;
}

export default function Stalls() {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [filteredStalls, setFilteredStalls] = useState<Stall[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStalls();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = stalls.filter(
        (stall) =>
          (stall.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
          (stall.event?.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
          (stall.leader?.full_name?.toLowerCase().includes(search.toLowerCase()) ?? false)
      );
      setFilteredStalls(filtered);
    } else {
      setFilteredStalls(stalls);
    }
  }, [search, stalls]);

  const fetchStalls = async () => {
    const { data, error } = await supabase
      .from('stalls')
      .select(`
        *,
        event:events(name),
        leader:profiles!leader_id(full_name)
      `)
      .eq('status', 'approved')
      .order('stall_number', { ascending: true });

    if (!error && data) {
      setStalls(data);
      setFilteredStalls(data);
    }
    setLoading(false);
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
          <People className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Approved Stalls</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Browse all approved stalls across events
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <SearchNormal1 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by stall name, event, or team leader..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
      </div>

      {/* Stalls Grid */}
      {filteredStalls.length === 0 ? (
        <Card>
          <CardContent className="py-12 md:py-16 text-center">
            <People className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-base md:text-lg font-semibold mb-2">No stalls found</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              {search ? 'Try adjusting your search' : 'No approved stalls yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredStalls.map((stall) => (
            <Card
              key={stall.id}
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50"
            >
              <CardHeader className="p-4 sm:p-6 pb-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge
                    variant="default"
                    className="text-sm md:text-base px-2.5 py-1 bg-gradient-to-r from-primary to-secondary"
                  >
                    #{stall.stall_number ?? 'N/A'}
                  </Badge>
                </div>
                <CardTitle className="text-base md:text-lg line-clamp-1 group-hover:text-primary transition-colors">
                  {stall.name}
                </CardTitle>
                <CardDescription className="text-xs md:text-sm pt-1">
                  {stall.event?.name || 'Unknown Event'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 p-4 sm:p-6 space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {stall.description || 'No description available'}
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <People className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs md:text-sm text-muted-foreground">
                    Led by {stall.leader?.full_name || 'Unknown'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}