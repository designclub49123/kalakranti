import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, DocumentDownload, Calendar } from 'iconsax-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Certificate {
  id: string;
  type: string;
  generated_at: string;
  event: {
    name: string;
  } | null;
  stall: {
    name: string;
  } | null;
  certificate_url?: string; // Added for download functionality
}

export default function Certificates() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchCertificates();
    }
  }, [profile]);

  const fetchCertificates = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        event:events(name),
        stall:stalls(name)
      `)
      .eq('user_id', profile.id)
      .order('generated_at', { ascending: false });

    if (!error && data) {
      setCertificates(data);
    }
    setLoading(false);
  };

  const getCertificateTypeBadge = (type: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary'; label: string }> = {
      leader: { variant: 'default', label: 'Team Leader' },
      member: { variant: 'secondary', label: 'Team Member' },
      participation: { variant: 'default', label: 'Participation' },
    };
    const config = variants[type] || { variant: 'default', label: type };
    return <Badge variant={config.variant} className="text-xs md:text-sm">{config.label}</Badge>;
  };

  const downloadCertificate = async (certificate: Certificate) => {
    if (!certificate.certificate_url) {
      toast({
        title: 'Error',
        description: 'Certificate file is not available for download.',
        variant: 'destructive',
      });
      return;
    }

    const loadingToast = toast({
      title: 'Preparing your certificate',
      description: 'Please wait while we prepare your download...',
    });

    try {
      // Get the file extension from the URL or default to pdf
      const fileExtension = certificate.certificate_url.split('.').pop()?.toLowerCase() || 'pdf';
      const fileName = `certificate_${certificate.id}.${fileExtension}`;
      
      // Try to download directly using the URL
      const response = await fetch(certificate.certificate_url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch certificate');
      }
      
      const blob = await response.blob();
      
      // For IE/Edge support
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, fileName);
      } else {
        // For modern browsers
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
        }, 0);
      }
      
      toast.dismiss(loadingToast);
      toast({
        title: 'Download Started',
        description: 'Your certificate download has started.',
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Download error:', error);
      toast.dismiss(loadingToast);
      
      // Fallback: Open in new tab if download fails
      try {
        window.open(certificate.certificate_url, '_blank');
        toast({
          title: 'Opening Certificate',
          description: 'Opening certificate in a new tab...',
          duration: 3000,
        });
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        toast({
          title: 'Download Failed',
          description: 'Could not download or open the certificate. Please try again later.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
        <div className="h-6 w-6 md:h-8 md:w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 space-y-6 pb-10 md:pb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Award className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Certificates</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            View and download your participation certificates
          </p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="py-12 md:py-16 text-center">
            <Award className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">No certificates yet</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              Participate in events to earn certificates
            </p>
            <Button asChild className="w-full sm:w-auto">
              <a href="/events">Browse Events</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-4 sm:p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Award className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  {getCertificateTypeBadge(cert.type)}
                </div>
                <CardTitle className="line-clamp-2 text-base md:text-lg">
                  {cert.event?.name || 'Event Certificate'}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1 text-xs md:text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Issued {format(new Date(cert.generated_at), 'MMM dd, yyyy')}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
                {cert.stall && (
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      For stall: <span className="font-medium">{cert.stall.name}</span>
                    </p>
                  </div>
                )}
                <div className="relative">
                  <Button
                    className="w-full group relative overflow-hidden"
                    variant="outline"
                    onClick={() => downloadCertificate(cert)}
                    disabled={!cert.certificate_url}
                  >
                    {cert.certificate_url ? (
                      <>
                        <DocumentDownload className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                        Download Certificate
                      </>
                    ) : (
                      <span className="text-muted-foreground">Download Unavailable</span>
                    )}
                  </Button>
                  {!cert.certificate_url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                      <span className="text-xs text-muted-foreground px-2 text-center">
                        Certificate will be available after event
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}