import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
// Import Iconsax icons
import { TickCircle, CloseCircle, Clock, People, Activity, DocumentText } from 'iconsax-react';

interface Stall {
  id: string;
  name: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  stall_number: number | null;
  applied_at: string;
  approved_at: string | null;
  event: { name: string } | null;
  leader: { full_name: string; email: string } | null;
  members: string[];
}

export default function AdminStalls() {
  const { isAdmin, isJuniorAdmin } = useAuth();
  const { toast } = useToast();
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin || isJuniorAdmin) {
      fetchStalls();
    }
  }, [isAdmin, isJuniorAdmin]);

  const fetchStalls = async () => {
    const { data, error } = await supabase
      .from('stalls')
      .select(`
        *,
        event:events(name),
        leader:profiles!leader_id(full_name, email)
      `)
      .order('applied_at', { ascending: false });

    if (!error && data) {
      setStalls(data);
    }
    setLoading(false);
  };

  const updateStallStatus = async (stallId: string, status: 'approved' | 'rejected') => {
    setUpdating(stallId);
    try {
      const { error } = await supabase
        .from('stalls')
        .update({ status })
        .eq('id', stallId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Stall ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      });
      fetchStalls();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const StallCard = ({ stall }: { stall: Stall }) => (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 bg-gradient-to-br from-card to-card/50">
      <CardHeader className="p-4 sm:p-6 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <CardTitle className="text-base md:text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
              {stall.name}
            </CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>{stall.event?.name || 'Event'}</span>
              </div>
              {stall.stall_number && (
                <Badge variant="outline" className="text-xs">#{stall.stall_number}</Badge>
              )}
            </div>
          </div>
          <Badge
            variant={
              stall.status === 'approved'
                ? 'default'
                : stall.status === 'rejected'
                ? 'destructive'
                : 'secondary'
            }
            className={`text-xs md:text-sm px-2 sm:px-3 py-1 ${stall.status === 'approved' ? 'bg-green-500 hover:bg-green-600' : ''}`}
          >
            {stall.status.charAt(0).toUpperCase() + stall.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
        {stall.description && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground leading-relaxed">{stall.description}</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
            <People className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-medium text-sm">Leader:</span>
              <span className="text-sm">{stall.leader?.full_name}</span>
              <p className="text-xs text-muted-foreground">{stall.leader?.email}</p>
            </div>
          </div>
          {stall.members.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <People className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="font-medium text-sm">Members:</span>
                <span className="text-sm ml-2">{stall.members.length} members</span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>Applied: {format(new Date(stall.applied_at), 'MMM dd, yyyy')}</span>
            </div>
            {stall.approved_at && (
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <TickCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>Approved: {format(new Date(stall.approved_at), 'MMM dd, yyyy')}</span>
              </div>
            )}
          </div>
        </div>

        {stall.status === 'pending' && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-border/50">
            <Button
              size="sm"
              onClick={() => updateStallStatus(stall.id, 'approved')}
              disabled={updating === stall.id}
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              <TickCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => updateStallStatus(stall.id, 'rejected')}
              disabled={updating === stall.id}
              className="flex-1"
            >
              <CloseCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!isAdmin && !isJuniorAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-10">
        <div className="text-center space-y-4">
          <DocumentText className="h-12 w-12 md:h-16 md:w-16 mx-auto text-muted-foreground" />
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
            You don't have permission to view this page.
          </p>
          <Button variant="outline" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] pt-10">
        <div className="text-center">
          <div className="h-6 w-6 md:h-8 md:w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm md:text-base text-muted-foreground">Loading stalls...</p>
        </div>
      </div>
    );
  }

  const pendingStalls = stalls.filter((s) => s.status === 'pending');
  const approvedStalls = stalls.filter((s) => s.status === 'approved');
  const rejectedStalls = stalls.filter((s) => s.status === 'rejected');

  return (
    <div className="container mx-auto px-4 space-y-6 pt-10 pb-10 md:pt-8 md:pb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <People className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Manage Stalls</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Review and approve stall registrations
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-muted/50">
          <TabsTrigger
            value="pending"
            className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Clock className="mr-2 h-4 w-4" />
            Pending ({pendingStalls.length})
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="text-xs sm:text-sm data-[state=active]:bg-green-500 data-[state=active]:text-green-foreground"
          >
            <TickCircle className="mr-2 h-4 w-4" />
            Approved ({approvedStalls.length})
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="text-xs sm:text-sm data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"
          >
            <CloseCircle className="mr-2 h-4 w-4" />
            Rejected ({rejectedStalls.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingStalls.length === 0 ? (
            <Card className="border-0 bg-gradient-to-br from-muted/50 to-muted/30">
              <CardContent className="py-12 md:py-16 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-muted rounded-full mb-4">
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">No pending applications</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  All stall registrations have been reviewed
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {pendingStalls.map((stall) => (
                <StallCard key={stall.id} stall={stall} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedStalls.length === 0 ? (
            <Card className="border-0 bg-gradient-to-br from-muted/50 to-muted/30">
              <CardContent className="py-12 md:py-16 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-muted rounded-full mb-4">
                  <TickCircle className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                </div>
                <p className="text-sm md:text-base text-muted-foreground">No approved stalls yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {approvedStalls.map((stall) => (
                <StallCard key={stall.id} stall={stall} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedStalls.length === 0 ? (
            <Card className="border-0 bg-gradient-to-br from-muted/50 to-muted/30">
              <CardContent className="py-12 md:py-16 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-muted rounded-full mb-4">
                  <CloseCircle className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                </div>
                <p className="text-sm md:text-base text-muted-foreground">No rejected stalls</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {rejectedStalls.map((stall) => (
                <StallCard key={stall.id} stall={stall} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}