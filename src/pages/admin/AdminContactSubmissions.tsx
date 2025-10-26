import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MessagesSquare, Mail, Phone, Calendar, Trash2, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
}

export default function AdminContactSubmissions() {
  const { isAdmin, isJuniorAdmin } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAdmin || isJuniorAdmin) {
      fetchSubmissions();
    }
  }, [isAdmin, isJuniorAdmin]);

  const fetchSubmissions = async () => {
    const { data, error } = await (supabase as any)
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSubmissions(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) return;

    const { error } = await (supabase as any)
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({ title: 'Success', description: 'Submission deleted successfully' });
      fetchSubmissions();
    }
  };

  const toggleRowExpand = (submissionId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(submissionId)) {
        newSet.delete(submissionId);
      } else {
        newSet.add(submissionId);
      }
      return newSet;
    });
  };

  const exportSubmissions = async () => {
    try {
      const { data: csvData, error } = await (supabase as any)
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const headers = ['Name', 'Email', 'Phone', 'Message', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          `"${row.name}","${row.email}","${row.phone || ''}","${row.message.replace(/"/g, '""')}","${format(new Date(row.created_at), 'yyyy-MM-dd HH:mm:ss')}"`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contact-submissions.csv';
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Submissions exported as CSV!'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (!isAdmin && !isJuniorAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-2 text-destructive">Access Denied</h2>
        <p className="text-muted-foreground">You don't have permission to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const submissionCount = submissions.length;

  return (
    <div className="container mx-auto px-4 space-y-6 pb-20 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contact Submissions</h1>
          <p className="text-muted-foreground">
            View and manage contact form submissions
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            {submissionCount} {submissionCount === 1 ? 'submission' : 'submissions'}
          </Badge>
          {submissionCount > 0 && (
            <Button onClick={exportSubmissions} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {submissionCount === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="py-16 text-center">
            <MessagesSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No submissions yet</h3>
            <p className="text-muted-foreground mb-6">
              Contact form submissions will appear here once users reach out.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Submissions Overview</CardTitle>
            <CardDescription>
              Review incoming messages and contact details below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <>
                      <TableRow key={submission.id} className="border-b hover:bg-muted/50">
                        <TableCell className="font-medium">{submission.name}</TableCell>
                        <TableCell>
                          <a href={`mailto:${submission.email}`} className="hover:underline">
                            {submission.email}
                          </a>
                        </TableCell>
                        <TableCell>
                          {submission.phone ? (
                            <a href={`tel:${submission.phone}`} className="hover:underline">
                              {submission.phone}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(submission.created_at), 'MMM dd, yyyy HH:mm')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleRowExpand(submission.id)}
                            >
                              {expandedRows.has(submission.id) ? 'Hide' : 'View'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDelete(submission.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(submission.id) && (
                        <TableRow>
                          <TableCell colSpan={5} className="p-0">
                            <div className="border-t bg-muted/20">
                              <div className="p-6 space-y-4">
                                <Separator />
                                <div className="space-y-3">
                                  <div className="flex items-start gap-3">
                                    <MessagesSquare className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm mb-1">Message</p>
                                      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        {submission.message}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2 pt-2">
                                    <Button size="sm" variant="outline" asChild>
                                      <a href={`mailto:${submission.email}`}>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Reply
                                      </a>
                                    </Button>
                                  </div>
                                </div>
                                <Separator />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}