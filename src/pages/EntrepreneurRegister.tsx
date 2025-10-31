import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function EntrepreneurRegister() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    year: '',
    idea_title: '',
    idea_summary: '',
    prior_experience: '',
    availability_hours: '',
    why_join: '',
    // Incubator-style
    problem_solution: '',
    validation: '',
    expected_support: '',
    has_prototype: 'no' as 'yes' | 'no',
    prototype_details: '',
    consent: false,
  });
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null);
  const [prototypeFile, setPrototypeFile] = useState<File | null>(null);

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.full_name ||
      !form.email ||
      !form.phone ||
      !form.department ||
      !form.year ||
      !form.idea_title ||
      !form.idea_summary ||
      !form.problem_solution ||
      !form.prior_experience ||
      !form.availability_hours ||
      !portfolioFile ||
      !resumeFile ||
      !pitchDeckFile ||
      !form.validation ||
      !form.expected_support ||
      (form.has_prototype === 'yes' && (!form.prototype_details || !prototypeFile)) ||
      !form.why_join ||
      !form.consent
    ) {
      toast.error('Please fill all fields and accept the consent.');
      return;
    }
    setSubmitting(true);
    try {
      // Upload files to storage
      const upload = async (folder: string, file: File) => {
        const ext = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}.${ext}`;
        const path = `entrepreneur/${folder}/${fileName}`;
        const { error: upErr } = await supabase.storage
          .from('gallery')
          .upload(path, file, { cacheControl: '3600', upsert: true, contentType: file.type || undefined });
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);
        return publicUrl as string;
      };

      const [portfolio_url, resume_url, pitch_deck_url, maybe_prototype_url] = await Promise.all([
        upload('portfolio', portfolioFile!),
        upload('resumes', resumeFile!),
        upload('pitchdecks', pitchDeckFile!),
        form.has_prototype === 'yes' && prototypeFile ? upload('prototypes', prototypeFile) : Promise.resolve(''),
      ]);

      const { error } = await (supabase.from as any)('volunteers').insert({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        department: form.department,
        year: form.year,
        portfolio_url,
        why_join: form.why_join,
        idea_title: form.idea_title,
        idea_summary: form.idea_summary,
        problem_solution: form.problem_solution,
        prior_experience: form.prior_experience,
        availability_hours: form.availability_hours,
        resume_url,
        // Incubator fields
        validation: form.validation,
        expected_support: form.expected_support,
        has_prototype: form.has_prototype === 'yes',
        prototype_details: form.prototype_details,
        pitch_deck_url,
        prototype_url: maybe_prototype_url || null,
        status: 'registered',
      });
      if (error) throw error;
      toast.success('Registration submitted! We will contact you for the interview phase.');
      setForm({
        full_name: '', email: '', phone: '', department: '', year: '', idea_title: '', idea_summary: '', prior_experience: '', availability_hours: '', why_join: '',
        problem_solution: '', validation: '', expected_support: '', has_prototype: 'no', prototype_details: '',
        consent: false,
      });
      setPortfolioFile(null);
      setResumeFile(null);
      setPitchDeckFile(null);
      setPrototypeFile(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Entrepreneur Cell — Registration
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">No login required. Apply for incubation support.</p>
      </header>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" required placeholder="e.g., 1st / 2nd / 3rd / 4th" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="idea_title">Startup/Idea Title *</Label>
              <Input id="idea_title" required value={form.idea_title} onChange={(e) => setForm({ ...form, idea_title: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="idea_summary">Idea Summary *</Label>
              <Textarea id="idea_summary" rows={3} required value={form.idea_summary} onChange={(e) => setForm({ ...form, idea_summary: e.target.value })} />
            </div>

            {/* Incubator-style questions */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="problem_solution">What problem are you solving and what is your solution? Why now? *</Label>
              <Textarea id="problem_solution" rows={4} required value={form.problem_solution} onChange={(e) => setForm({ ...form, problem_solution: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="validation">What validation have you done? (users, interviews, pilots) *</Label>
              <Textarea id="validation" rows={3} required value={form.validation} onChange={(e) => setForm({ ...form, validation: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="expected_support">What are you expecting from us as an incubation? *</Label>
              <Textarea id="expected_support" rows={3} required value={form.expected_support} onChange={(e) => setForm({ ...form, expected_support: e.target.value })} />
            </div>

            {/* Prototype section */}
            <div className="space-y-2">
              <Label>Do you have a prototype? *</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="has_prototype" value="yes" checked={form.has_prototype === 'yes'} onChange={() => setForm({ ...form, has_prototype: 'yes' })} required />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="has_prototype" value="no" checked={form.has_prototype === 'no'} onChange={() => setForm({ ...form, has_prototype: 'no', prototype_details: '' })} />
                  No
                </label>
              </div>
            </div>
            {form.has_prototype === 'yes' && (
              <>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="prototype_details">Prototype details (stack, link notes) *</Label>
                  <Textarea id="prototype_details" rows={3} required value={form.prototype_details} onChange={(e) => setForm({ ...form, prototype_details: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prototype_file">Prototype (ZIP/APK) *</Label>
                  <Input id="prototype_file" type="file" accept=".zip,.apk" onChange={(e) => setPrototypeFile(e.target.files?.[0] || null)} required />
                </div>
              </>
            )}

            {/* Pitch deck */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="pitch_deck_file">Pitch Deck (PDF) *</Label>
              <Input id="pitch_deck_file" type="file" required accept=".pdf" onChange={(e) => setPitchDeckFile(e.target.files?.[0] || null)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="prior_experience">Prior Experience (hackathons, clubs, internships)</Label>
              <Textarea id="prior_experience" rows={3} required value={form.prior_experience} onChange={(e) => setForm({ ...form, prior_experience: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability_hours">Availability (hrs/week)</Label>
              <Input id="availability_hours" required value={form.availability_hours} onChange={(e) => setForm({ ...form, availability_hours: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio_file">Portfolio (PDF/ZIP) *</Label>
              <Input id="portfolio_file" type="file" required accept=".pdf,.zip" onChange={(e) => setPortfolioFile(e.target.files?.[0] || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resume_file">Resume/CV (PDF) *</Label>
              <Input id="resume_file" type="file" required accept=".pdf" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="why_join">Why do you want to join? (2-3 lines)</Label>
              <Textarea id="why_join" rows={4} required value={form.why_join} onChange={(e) => setForm({ ...form, why_join: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input id="consent" type="checkbox" required checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
              <Label htmlFor="consent">I confirm the information is accurate and I agree to be contacted.*</Label>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={submitting} className="w-full md:w-auto">
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
