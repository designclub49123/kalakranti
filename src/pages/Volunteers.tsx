import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export default function Volunteers() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Entrepreneur Cell — Incubation Support</h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">Apply for incubation. Share your idea and validation — no login required to register.</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <a href="#overview" className="text-sm px-3 py-1 rounded-full border hover:bg-accent">Overview</a>
          <a href="#phases" className="text-sm px-3 py-1 rounded-full border hover:bg-accent">Phases</a>
          <a href="#benefits" className="text-sm px-3 py-1 rounded-full border hover:bg-accent">Incubation Offerings</a>
        </div>
      </header>

      <section id="overview" className="space-y-4">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Overview</h2>
        <Card className="border-2 border-blue-200 dark:border-blue-900/40 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-900/60">
          <CardContent className="p-6 space-y-3 text-sm md:text-base">
            <p>
              We recruit volunteers across coding and marketing tracks and provide a starter kit, mentorship, and hands‑on experience.
              Whether you want to build products, grow communities, or start a startup, this is for you.
            </p>
            <p>
              Annual drive — limited seats. Be attentive, explore roles, and submit your application below.
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-200 dark:border-purple-900/40 bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-900/60">
          <CardContent className="p-6 space-y-2">
            <h3 className="text-lg font-semibold">Incubation Support</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Explore as Entrepreneur Cell is about to give incubation support. We will give you the incubation support as per your startup. If you are curious about starting a startup, here is your chance — register and be an entrepreneur. Early registration will get first support. We are only giving the top 10 startup ideas incubation support, so please be attentive and let your startup raise.
            </p>
          </CardContent>
        </Card>
      </section>

      <section id="phases" className="space-y-4">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">Incubation Phases</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-2 border-indigo-200 dark:border-indigo-900/40 bg-gradient-to-br from-white to-indigo-50 dark:from-gray-900 dark:to-gray-900/60"><CardContent className="p-6"><h3 className="font-semibold mb-2">Phase 1 — Application</h3><p className="text-sm text-muted-foreground">Submit your idea, validation, and supporting files.</p></CardContent></Card>
          <Card className="border-2 border-violet-200 dark:border-violet-900/40 bg-gradient-to-br from-white to-violet-50 dark:from-gray-900 dark:to-gray-900/60"><CardContent className="p-6"><h3 className="font-semibold mb-2">Phase 2 — Review</h3><p className="text-sm text-muted-foreground">Panel evaluates problem-solution fit and potential.</p></CardContent></Card>
          <Card className="border-2 border-cyan-200 dark:border-cyan-900/40 bg-gradient-to-br from-white to-cyan-50 dark:from-gray-900 dark:to-gray-900/60"><CardContent className="p-6"><h3 className="font-semibold mb-2">Phase 3 — Selection</h3><p className="text-sm text-muted-foreground">Top startups receive incubation support.</p></CardContent></Card>
        </div>
      </section>

      <section id="benefits" className="space-y-4">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Incubation Offerings</h2>
        <Card className="border-2 border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-gray-900/60">
          <CardContent className="p-6">
            <ul className="grid md:grid-cols-2 gap-3 text-sm">
              <li className="flex items-center gap-2"><Badge variant="outline">Mentorship</Badge> Guidance from founders and domain experts</li>
              <li className="flex items-center gap-2"><Badge variant="outline">Resources</Badge> Credits, tools, and workspace support</li>
              <li className="flex items-center gap-2"><Badge variant="outline">Network</Badge> Industry connects and demo day exposure</li>
              <li className="flex items-center gap-2"><Badge variant="outline">Execution</Badge> Help with validation, GTM and growth
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
      <section className="space-y-4">
        <Card>
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Ready to join?</h3>
              <p className="text-sm text-muted-foreground">Proceed to registration — no login required.</p>
            </div>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90">
              <Link to="/entrepreneur-cell/register">Register as Entrepreneur</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
