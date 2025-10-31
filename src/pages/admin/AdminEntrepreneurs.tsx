import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface VolunteerRow {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  idea_title: string;
  idea_summary: string;
  validation: string;
  expected_support: string;
  portfolio_url: string;
  resume_url: string;
  pitch_deck_url: string;
  prototype_url: string | null;
  status: string;
}

export default function AdminEntrepreneurs() {
  const [rows, setRows] = useState<VolunteerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<VolunteerRow | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await (supabase.from as any)('volunteers')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setRows(data as VolunteerRow[]);
      } catch (e: any) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = rows.filter((r) => {
    const q = query.toLowerCase();
    return (
      r.full_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.phone || '').toLowerCase().includes(q) ||
      (r.idea_title || '').toLowerCase().includes(q) ||
      (r.validation || '').toLowerCase().includes(q) ||
      (r.expected_support || '').toLowerCase().includes(q)
    );
  });

  const exportCsv = () => {
    const headers = [
      'id','created_at','full_name','email','phone','idea_title','idea_summary','validation','expected_support','portfolio_url','resume_url','pitch_deck_url','prototype_url','status'
    ];
    const esc = (v: any) => {
      if (v == null) return '';
      const s = String(v).replace(/"/g, '""');
      return `"${s}` + `"`;
    };
    const lines = [headers.join(',')].concat(
      rows.map(r => headers.map(h => esc((r as any)[h])).join(','))
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `entrepreneurs_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-10 md:py-12 space-y-6">
      

      <Card className="border border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Filters & Actions</CardTitle>
          <CardDescription>Quickly search and export applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="q">Search</Label>
              <Input id="q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, email, idea..." />
            </div>
            <div className="md:col-span-1 flex items-end">
              <Button className="w-full" onClick={exportCsv}>Export CSV</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No submissions found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-accent/50 text-foreground">
                <tr>
                  <th className="text-left p-3">Application Name</th>
                  <th className="text-left p-3">Number</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Submitted Date</th>
                  <th className="text-left p-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border align-middle">
                    <td className="p-3">
                      <div className="font-medium">{r.full_name}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">{r.phone}</td>
                    <td className="p-3 whitespace-nowrap">{r.status || 'registered'}</td>
                    <td className="p-3 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-3">
                      <Button variant="outline" size="sm" onClick={() => setSelected(r)}>Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl max-w-3xl w-[95%] max-h-[85vh] overflow-y-auto">
            <div className="p-4 md:p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">Application Details</h2>
              <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
            </div>
            <div className="p-4 md:p-6 space-y-4 text-sm">
              <div className="grid md:grid-cols-2 gap-3">
                <div><Label>Name</Label><div>{selected.full_name}</div></div>
                <div><Label>Submitted</Label><div>{new Date(selected.created_at).toLocaleString()}</div></div>
                <div><Label>Email</Label><div>{selected.email}</div></div>
                <div><Label>Phone</Label><div>{selected.phone}</div></div>
                <div className="md:col-span-2"><Label>Idea Title</Label><div className="font-medium">{selected.idea_title}</div></div>
                <div className="md:col-span-2"><Label>Idea Summary</Label><div className="whitespace-pre-wrap">{selected.idea_summary}</div></div>
                <div className="md:col-span-2"><Label>Validation</Label><div className="whitespace-pre-wrap">{selected.validation}</div></div>
                <div className="md:col-span-2"><Label>Expected Support</Label><div className="whitespace-pre-wrap">{selected.expected_support}</div></div>
                <div className="md:col-span-2"><Label>Status</Label><div>{selected.status || 'registered'}</div></div>
                <div className="md:col-span-2"><Label>Files</Label>
                  <div className="space-y-1">
                    <a className="text-blue-600 hover:underline" href={selected.pitch_deck_url} target="_blank" rel="noreferrer">Pitch Deck</a>
                    <a className="text-blue-600 hover:underline block" href={selected.portfolio_url} target="_blank" rel="noreferrer">Portfolio</a>
                    <a className="text-blue-600 hover:underline block" href={selected.resume_url} target="_blank" rel="noreferrer">Resume</a>
                    {selected.prototype_url ? (
                      <a className="text-blue-600 hover:underline block" href={selected.prototype_url} target="_blank" rel="noreferrer">Prototype</a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
