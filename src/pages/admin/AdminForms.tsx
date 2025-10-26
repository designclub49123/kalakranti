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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
// Import Iconsax icons
import { DocumentText, Add, Edit, Trash, Chart, ArrowDown2, ArrowUp2 } from 'iconsax-react';

interface Form {
  id: string;
  title: string;
  description: string | null;
  questions: any[];
  is_active: boolean;
  created_at: string;
}

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'multiple_choice' | 'checkbox' | 'dropdown' | 'scale';
  question: string;
  options?: string[];
  required: boolean;
}

export default function AdminForms() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [] as Question[],
  });
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAdmin) {
      fetchForms();
    }
  }, [isAdmin]);

  const fetchForms = async () => {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setForms(data);
    }
    setLoading(false);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type: 'text',
      question: '',
      required: false,
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setFormData({
      ...formData,
      questions: formData.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    });
  };

  const removeQuestion = (id: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((q) => q.id !== id),
    });
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleQuestionExpand = (id: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const addOption = (questionId: string) => {
    const question = formData.questions.find((q) => q.id === questionId);
    if (question && question.options) {
      updateQuestion(questionId, { options: [...question.options, ''] });
    }
  };

  const updateOption = (questionId: string, index: number, value: string) => {
    const question = formData.questions.find((q) => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[index] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: string, index: number) => {
    const question = formData.questions.find((q) => q.id === questionId);
    if (question && question.options) {
      const newOptions = question.options.filter((_, i) => i !== index);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim()) return;

    try {
      if (editingForm) {
        const { error } = await supabase
          .from('forms')
          .update({
            title: formData.title,
            description: formData.description,
            questions: formData.questions,
          })
          .eq('id', editingForm.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Form updated successfully' });
      } else {
        const { error } = await supabase
          .from('forms')
          .insert({
            title: formData.title,
            description: formData.description,
            questions: formData.questions,
            admin_id: user.id,
          });

        if (error) throw error;
        toast({ title: 'Success', description: 'Form created successfully' });
      }

      setOpen(false);
      resetForm();
      fetchForms();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;

    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Success', description: 'Form deleted successfully' });
      fetchForms();
    }
  };

  const toggleActive = async (form: Form) => {
    const { error } = await supabase
      .from('forms')
      .update({ is_active: !form.is_active })
      .eq('id', form.id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: `Form ${form.is_active ? 'deactivated' : 'activated'} successfully`,
      });
      fetchForms();
    }
  };

  const handleEdit = (form: Form) => {
    setEditingForm(form);
    setFormData({
      title: form.title,
      description: form.description || '',
      questions: form.questions,
    });
    setExpandedQuestions(new Set(form.questions.map((q) => q.id)));
    setOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      questions: [],
    });
    setEditingForm(null);
    setExpandedQuestions(new Set());
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Forms Builder</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Create custom forms for surveys, registrations, and feedback
          </p>
        </div>
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Add className="mr-2 h-4 w-4" />
              Create Form
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-[90vw] sm:max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="px-4 sm:px-6 py-4 border-b">
              <DialogTitle className="text-lg md:text-xl">{editingForm ? 'Edit Form' : 'Create New Form'}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[calc(90vh-100px)]">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Form Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter form title"
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
                    placeholder="Form description (optional)..."
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <Label className="text-base font-medium">Questions ({formData.questions.length})</Label>
                    <Button type="button" size="sm" onClick={addQuestion} variant="outline">
                      <Add className="mr-2 h-4 w-4" />
                      Add Question
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {formData.questions.map((question, index) => (
                      <Collapsible key={question.id} open={expandedQuestions.has(question.id)}>
                        <CollapsibleTrigger asChild>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-2">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full">
                              <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                              <Input
                                value={question.question}
                                onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                                placeholder={`Enter question ${index + 1}`}
                                className="flex-1 h-8"
                              />
                              <Select
                                value={question.type}
                                onValueChange={(val: any) => updateQuestion(question.id, { type: val })}
                              >
                                <SelectTrigger className="w-full sm:w-[140px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Short Text</SelectItem>
                                  <SelectItem value="textarea">Long Text</SelectItem>
                                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                  <SelectItem value="checkbox">Checkboxes</SelectItem>
                                  <SelectItem value="dropdown">Dropdown</SelectItem>
                                  <SelectItem value="scale">Scale (1-5)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); toggleQuestionExpand(question.id); }}
                                className="h-6 w-6"
                              >
                                {expandedQuestions.has(question.id) ? (
                                  <ArrowUp2 className="h-4 w-4" />
                                ) : (
                                  <ArrowDown2 className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); removeQuestion(question.id); }}
                                className="h-6 w-6"
                              >
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-3 p-3 sm:p-4 border-t bg-muted/20">
                          {['multiple_choice', 'checkbox', 'dropdown'].includes(question.type) && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Options</Label>
                              <div className="space-y-1">
                                {question.options?.map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center gap-2">
                                    <Input
                                      value={option}
                                      onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                      placeholder={`Option ${optIndex + 1}`}
                                      className="flex-1 h-8"
                                    />
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => removeOption(question.id, optIndex)}
                                      className="h-6 w-6"
                                    >
                                      <Trash className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )) || null}
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addOption(question.id)}
                                  className="text-xs"
                                >
                                  + Add Option
                                </Button>
                              </div>
                            </div>
                          )}

                          {question.type === 'scale' && (
                            <div className="p-3 bg-muted/30 rounded-md">
                              <p className="text-sm text-muted-foreground">Scale from 1 to 5 (default)</p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-2">
                            <input
                              type="checkbox"
                              id={`required-${question.id}`}
                              checked={question.required}
                              onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor={`required-${question.id}`} className="text-sm cursor-pointer">
                              Required
                            </Label>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingForm ? 'Update Form' : 'Create Form'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {forms.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="py-12 md:py-16 text-center">
            <DocumentText className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">No forms yet</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-6">
              Create your first form to start collecting responses
            </p>
            <Button className="w-full sm:w-auto">
              <Add className="mr-2 h-4 w-4" />
              Create First Form
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base md:text-lg line-clamp-1">{form.title}</CardTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <CardDescription className="text-xs">
                        {form.questions.length} questions • {new Date(form.created_at).toLocaleDateString()}
                      </CardDescription>
                      <Badge variant="outline" className="text-xs">
                        {form.is_active ? 'Active' : 'Draft'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-4">
                {form.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{form.description}</p>
                )}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(form)}>
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => (window.location.href = `/admin/forms/${form.id}/responses`)}
                  >
                    <Chart className="mr-1 h-3 w-3" />
                    Responses
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleActive(form)}>
                    {form.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(form.id)}>
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