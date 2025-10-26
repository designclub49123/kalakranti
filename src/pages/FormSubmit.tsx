import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, Edit3, FileText, List, MessageSquare, CheckSquare, Star } from 'lucide-react';

interface Form {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
  is_active: boolean;
}

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'multiple_choice' | 'checkbox' | 'dropdown' | 'scale';
  question: string;
  options?: string[];
  required: boolean;
}

export default function FormSubmit() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<Record<string, any>>({});

  useEffect(() => {
    if (formId) {
      fetchForm();
    }
  }, [formId]);

  const fetchForm = async () => {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      toast({
        title: 'Error',
        description: 'Form not found or inactive',
        variant: 'destructive'
      });
      navigate('/');
    } else {
      setForm(data as any as Form);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Validate required fields
    const missingRequired = form.questions.some(
      q => q.required && !responses[q.id]
    );

    if (missingRequired) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('form_responses')
        .insert({
          form_id: form.id,
          responses: responses,
          user_id: null // Anonymous submission
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: 'Success',
        description: 'Form submitted successfully!'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question, idx: number) => {
    const updateResponse = (value: any) => {
      setResponses({ ...responses, [question.id]: value });
    };

    const getIcon = () => {
      switch (question.type) {
        case 'text': return <Edit3 className="h-4 w-4" />;
        case 'textarea': return <MessageSquare className="h-4 w-4" />;
        case 'multiple_choice': return <List className="h-4 w-4" />;
        case 'checkbox': return <CheckSquare className="h-4 w-4" />;
        case 'dropdown': return <List className="h-4 w-4" />;
        case 'scale': return <Star className="h-4 w-4" />;
        default: return <FileText className="h-4 w-4" />;
      }
    };

    return (
      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
        <Label className="flex items-center gap-2 text-base font-medium">
          <span className="w-6 text-center">{idx + 1}.</span>
          {getIcon()}
          {question.question}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <div className="space-y-2">
          {(() => {
            switch (question.type) {
              case 'text':
                return (
                  <div className="relative">
                    <Input
                      value={responses[question.id] || ''}
                      onChange={(e) => updateResponse(e.target.value)}
                      required={question.required}
                      className="pl-10 h-10"
                      placeholder="Enter your response..."
                    />
                  </div>
                );
              
              case 'textarea':
                return (
                  <div className="relative">
                    <Textarea
                      value={responses[question.id] || ''}
                      onChange={(e) => updateResponse(e.target.value)}
                      required={question.required}
                      rows={4}
                      className="min-h-[100px] pl-10 pt-10 resize-none"
                      placeholder="Enter your detailed response..."
                    />
                  </div>
                );
              
              case 'multiple_choice':
                return (
                  <RadioGroup
                    value={responses[question.id]}
                    onValueChange={updateResponse}
                    required={question.required}
                    className="space-y-2"
                  >
                    {question.options?.map((option, oIdx) => (
                      <div key={oIdx} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted">
                        <RadioGroupItem value={option} id={`${question.id}-${oIdx}`} />
                        <Label htmlFor={`${question.id}-${oIdx}`} className="cursor-pointer">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                );
              
              case 'checkbox':
                return (
                  <div className="space-y-2">
                    {question.options?.map((option, oIdx) => (
                      <div key={oIdx} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                        <Checkbox
                          id={`${question.id}-${oIdx}`}
                          checked={responses[question.id]?.[option] || false}
                          onCheckedChange={(checked) => {
                            updateResponse({
                              ...responses[question.id],
                              [option]: checked
                            });
                          }}
                        />
                        <Label htmlFor={`${question.id}-${oIdx}`} className="cursor-pointer">{option}</Label>
                      </div>
                    ))}
                  </div>
                );
              
              case 'dropdown':
                return (
                  <Select value={responses[question.id]} onValueChange={updateResponse}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options?.map((option, oIdx) => (
                        <SelectItem key={oIdx} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              
              case 'scale':
                return (
                  <RadioGroup
                    value={responses[question.id]}
                    onValueChange={updateResponse}
                    className="flex justify-between items-center gap-2 p-2 bg-background rounded-md"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className="flex flex-col items-center space-y-1">
                        <RadioGroupItem value={String(num)} id={`${question.id}-${num}`} />
                        <Label htmlFor={`${question.id}-${num}`} className="text-xs">{num}</Label>
                      </div>
                    ))}
                    <span className="text-sm font-medium">Rating</span>
                  </RadioGroup>
                );
              
              default:
                return null;
            }
          })()}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto pt-20 pb-20 md:pt-8 md:pb-8 px-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription className="text-lg">
              Your response has been submitted successfully.
            </CardDescription>
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="max-w-3xl mx-auto pt-20 pb-20 md:pt-8 md:pb-8 px-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <FileText className="h-6 w-6" />
            {form.title}
          </CardTitle>
          {form.description && (
            <CardDescription className="text-center max-w-2xl mx-auto">
              {form.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.questions.map((question, idx) => (
              <div key={question.id}>
                {renderQuestion(question, idx)}
              </div>
            ))}

            <Button type="submit" className="w-full h-12" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Form
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}