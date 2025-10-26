import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
// Import Iconsax icons
import { ArrowLeft2, Copy, ExportSquare, Chart, People } from 'iconsax-react';

interface FormResponse {
  id: string;
  responses: Record<string, any>;
  submitted_at: string;
}

interface Form {
  id: string;
  title: string;
  questions: Array<{
    id: string;
    question: string;
    type: string;
  }>;
}

export default function AdminFormResponses() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isJuniorAdmin } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAdmin || isJuniorAdmin) {
      fetchForm();
      fetchResponses();
    }
  }, [formId, isAdmin, isJuniorAdmin]);

  const fetchForm = async () => {
    const { data } = await supabase
      .from('forms')
      .select('id, title, questions')
      .eq('id', formId)
      .single();

    if (data) setForm(data as any as Form);
  };

  const fetchResponses = async () => {
    const { data, error } = await supabase
      .from('form_responses')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false });

    if (!error && data) {
      setResponses(data as any as FormResponse[]);
    }
    setLoading(false);
  };

  const copyFormLink = () => {
    const link = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Success',
      description: 'Form link copied to clipboard!',
    });
  };

  const toggleRowExpand = (responseId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(responseId)) {
        newSet.delete(responseId);
      } else {
        newSet.add(responseId);
      }
      return newSet;
    });
  };

  const exportResponses = async () => {
    try {
      const { data: csvData, error } = await supabase
        .from('form_responses')
        .select('*')
        .eq('form_id', formId);

      if (error) throw error;

      const headers = ['Submitted At', 'Responses'];
      const csvContent = [
        headers.join(','),
        ...csvData.map((row) =>
          `"${format(new Date(row.submitted_at), 'MMM dd, yyyy HH:mm')}",${JSON.stringify(row.responses).replace(/"/g, '""')}`
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-${formId}-responses.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Responses exported as CSV!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (!isAdmin && !isJuniorAdmin) {
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

  const responseCount = responses.length;

  return (
    <div className="container mx-auto px-4 space-y-6 pb-10 md:pb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/forms')}>
            <ArrowLeft2 className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{form?.title}</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {responseCount} {responseCount === 1 ? 'response' : 'responses'}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={copyFormLink} variant="outline" className="w-full sm:w-auto">
            <Copy className="mr-2 h-4 w-4" />
            Copy Form Link
          </Button>
          {responseCount > 0 && (
            <Button onClick={exportResponses} variant="outline" className="w-full sm:w-auto">
              <ExportSquare className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {responseCount === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="py-12 md:py-16 text-center">
            <People className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">No responses yet</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-6">
              Share the form link to start collecting responses
            </p>
            <Button onClick={copyFormLink} className="w-full sm:w-auto">
              <Copy className="mr-2 h-4 w-4" />
              Copy Form Link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg md:text-xl">Responses Overview</CardTitle>
            <CardDescription className="text-sm md:text-base">
              View individual responses and their submission details below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-400px)] sm:h-[calc(100vh-300px)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">ID</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response, idx) => (
                    <>
                      <TableRow key={response.id} className="border-b hover:bg-muted/50">
                        <TableCell className="font-medium text-sm">
                          #{responseCount - idx}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(response.submitted_at), 'MMM dd, yyyy HH:mm')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleRowExpand(response.id)}
                          >
                            {expandedRows.has(response.id) ? 'Hide' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(response.id) && (
                        <TableRow>
                          <TableCell colSpan={3} className="p-0">
                            <div className="border-t bg-muted/20">
                              <div className="p-4 sm:p-6 space-y-4">
                                <Separator />
                                {form?.questions.map((question) => {
                                  const answer = response.responses[question.id];
                                  if (!answer) return null;

                                  let displayAnswer = answer;
                                  if (typeof answer === 'object') {
                                    displayAnswer = Object.entries(answer)
                                      .filter(([_, v]) => v)
                                      .map(([k]) => k)
                                      .join(', ');
                                  }

                                  return (
                                    <div key={question.id} className="space-y-1">
                                      <div className="flex items-start justify-between">
                                        <p className="font-medium text-sm">{question.question}</p>
                                        <Badge variant="secondary" className="text-xs">
                                          {question.type.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground pl-2 border-l-2 border-primary">
                                        {displayAnswer || 'No response'}
                                      </p>
                                    </div>
                                  );
                                })}
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