import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Image as ImageIcon, Video, Newspaper, FileText, Clapperboard, Upload } from 'lucide-react';

interface GalleryItem {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

type StoredItem = {
  name: string;
  url: string;
  sizeBytes?: number;
  displayName?: string;
  extension?: string;
};

export default function Media() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Other media types
  const [videos, setVideos] = useState<StoredItem[]>([]);
  const [clips, setClips] = useState<StoredItem[]>([]);
  const [news, setNews] = useState<StoredItem[]>([]);
  const [reports, setReports] = useState<StoredItem[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingClips, setLoadingClips] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  // Section-specific upload dialogs
  const [openVideo, setOpenVideo] = useState(false);
  const [openClip, setOpenClip] = useState(false);
  const [openNews, setOpenNews] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [fileVideo, setFileVideo] = useState<File | null>(null);
  const [fileClip, setFileClip] = useState<File | null>(null);
  const [fileNews, setFileNews] = useState<File | null>(null);
  const [fileReport, setFileReport] = useState<File | null>(null);
  const [reportName, setReportName] = useState('');

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes <= 0) return undefined;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getTypeLabel = (ext?: string) => {
    const e = (ext || '').toLowerCase();
    if (e === 'pdf') return 'PDF File';
    if (e === 'ppt' || e === 'pptx') return 'PPT File';
    return 'File';
  };

  useEffect(() => {
    const fetchImages = async () => {
      setLoadingImages(true);
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setImages(data);
      }
      setLoadingImages(false);
    };

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes <= 0) return undefined;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getTypeLabel = (ext?: string) => {
    const e = (ext || '').toLowerCase();
    if (e === 'pdf') return 'PDF File';
    if (e === 'ppt' || e === 'pptx') return 'PPT File';
    return 'File';
  };

    fetchImages();
  }, []);

  const listFromStorage = async (folder: string): Promise<StoredItem[]> => {
    try {
      const { data, error } = await supabase.storage
        .from('gallery')
        .list(folder, { limit: 100, sortBy: { column: 'updated_at', order: 'desc' } });
      if (error || !data) return [];
      const items = data
        .filter((f) => f.id)
        .map((f) => {
          const path = `${folder}/${f.name}`;
          const { data: pub } = supabase.storage.from('gallery').getPublicUrl(path);
          // Parse display name if encoded as NAME___random.ext
          const ext = f.name.includes('.') ? f.name.split('.').pop()!.toLowerCase() : '';
          const base = f.name.replace(/\.[^/.]+$/, '');
          const disp = base.includes('___') ? base.split('___')[0] : f.name;
          return { name: f.name, url: pub.publicUrl, displayName: disp, extension: ext };
        });
      // Try to fetch size via HEAD (best-effort)
      const withSizes = await Promise.all(items.map(async (it) => {
        try {
          const res = await fetch(it.url, { method: 'HEAD' });
          const cl = res.headers.get('content-length');
          return { ...it, sizeBytes: cl ? parseInt(cl, 10) : undefined } as StoredItem;
        } catch {
          return it;
        }
      }));
      return withSizes;
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoadingVideos(true);
      setLoadingClips(true);
      setLoadingNews(true);
      setLoadingReports(true);
      const [v, c, n, r] = await Promise.all([
        listFromStorage('videos'),
        listFromStorage('clips'),
        listFromStorage('news'),
        listFromStorage('reports'),
      ]);
      setVideos(v);
      setClips(c);
      setNews(n);
      setReports(r);
      setLoadingVideos(false);
      setLoadingClips(false);
      setLoadingNews(false);
      setLoadingReports(false);
    };
    load();
  }, []);

  const sanitizeName = (s: string) => s.trim().replace(/[^a-zA-Z0-9-_\/\s]/g, '').replace(/\s+/g, ' ').slice(0, 80);

  const uploadToFolder = async (folder: string, file: File | null, opts?: { displayName?: string }) => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const prefix = opts?.displayName ? `${sanitizeName(opts.displayName)}___` : '';
      const fileName = `${prefix}${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `${folder}/${fileName}`;
      const { error } = await supabase.storage
        .from('gallery')
        .upload(filePath, file, { cacheControl: '3600', upsert: true, contentType: file.type || undefined });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath);
      return publicUrl as string;
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('gallery')
        .insert({
          image_url: publicUrl,
          caption: caption || null,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (insertError) throw insertError;

      toast({
        title: 'Success',
        description: 'Image uploaded successfully'
      });

      setOpen(false);
      setCaption('');
      setSelectedFile(null);
      // refresh
      const { data } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });
      setImages(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 md:pb-8">
      <header id="top" className="space-y-2">
        <h1 className="text-3xl font-bold">Media</h1>
        <p className="text-muted-foreground">Browse photos, videos, clips, news coverage, and reports in one place.</p>
        <nav className="flex flex-wrap gap-2 mt-4">
          <a href="#images" className="text-sm px-3 py-1 rounded-full border hover:bg-accent">Images</a>
          <a href="#videos" className="text-sm px-3 py-1 rounded-full border hover:bg-accent">Videos</a>
          <a href="#clips" className="text-sm px-3 py-1 rounded-full border hover:bg-accent">Clips</a>
          <a href="#news" className="text-sm px-3 py-1 rounded-full border hover:bg-accent">News Coverage</a>
          <a href="#reports" className="text-sm px-3 py-1 rounded-full border hover:bg-accent">Reports</a>
        </nav>
      </header>

      {/* Images Section */}
      <section id="images" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">Images</h2>
          </div>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Image</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image">Image</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="caption">Caption (Optional)</Label>
                    <Textarea
                      id="caption"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Add a caption..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="w-full">
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loadingImages ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h3 className="text-lg font-semibold mb-2">No images yet</h3>
              <p className="text-muted-foreground">Check back later for event photos</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((item) => (
              <Card key={item.id} className="overflow-hidden group cursor-pointer hover:shadow-xl transition-base">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.caption || 'Gallery image'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  {item.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <p className="text-sm text-white">{item.caption}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
        <div className="pt-2">
          <Button asChild variant="outline">
            <a href="#top">Back to top</a>
          </Button>
        </div>
      </section>

      {/* Videos Section */}
      <section id="videos" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">Videos</h2>
          </div>
          {isAdmin && (
            <Dialog open={openVideo} onOpenChange={setOpenVideo}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Video</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="video">Video</Label>
                    <Input id="video" type="file" accept="video/*" onChange={(e) => setFileVideo(e.target.files?.[0] || null)} />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!fileVideo || uploading}
                    onClick={async () => {
                      const url = await uploadToFolder('videos', fileVideo);
                      if (url) {
                        setVideos([{ name: fileVideo!.name, url }, ...videos]);
                        setOpenVideo(false);
                        setFileVideo(null);
                        toast({ title: 'Success', description: 'Video uploaded successfully' });
                      }
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Upload Video'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loadingVideos ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-video bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
              <p className="text-muted-foreground">Videos will appear here once added</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((v) => (
              <Card key={v.url} className="overflow-hidden">
                <CardContent className="p-0">
                  <video src={v.url} controls className="w-full aspect-video" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Clips Section */}
      <section id="clips" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clapperboard className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">Clips</h2>
          </div>
          {isAdmin && (
            <Dialog open={openClip} onOpenChange={setOpenClip}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Clip</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clip">Clip</Label>
                    <Input id="clip" type="file" accept="video/*" onChange={(e) => setFileClip(e.target.files?.[0] || null)} />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!fileClip || uploading}
                    onClick={async () => {
                      const url = await uploadToFolder('clips', fileClip);
                      if (url) {
                        setClips([{ name: fileClip!.name, url }, ...clips]);
                        setOpenClip(false);
                        setFileClip(null);
                        toast({ title: 'Success', description: 'Clip uploaded successfully' });
                      }
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Upload Clip'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        {loadingClips ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-video bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : clips.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Clapperboard className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h3 className="text-lg font-semibold mb-2">No clips yet</h3>
              <p className="text-muted-foreground">Short clips will appear here once added</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clips.map((c) => (
              <Card key={c.url} className="overflow-hidden">
                <CardContent className="p-0">
                  <video src={c.url} controls className="w-full aspect-video" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* News Coverage Section */}
      <section id="news" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">News Coverage</h2>
          </div>
          {isAdmin && (
            <Dialog open={openNews} onOpenChange={setOpenNews}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload News Coverage (image or PDF)</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="news">File</Label>
                    <Input id="news" type="file" accept="image/*,application/pdf" onChange={(e) => setFileNews(e.target.files?.[0] || null)} />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!fileNews || uploading}
                    onClick={async () => {
                      const url = await uploadToFolder('news', fileNews);
                      if (url) {
                        setNews([{ name: fileNews!.name, url }, ...news]);
                        setOpenNews(false);
                        setFileNews(null);
                        toast({ title: 'Success', description: 'News item uploaded successfully' });
                      }
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        {loadingNews ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : news.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Newspaper className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h3 className="text-lg font-semibold mb-2">No news coverage yet</h3>
              <p className="text-muted-foreground">Articles and newspaper coverage will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.map((n) => (
              <Card key={n.url} className="overflow-hidden group hover:shadow">
                <CardContent className="p-0">
                  {n.url.toLowerCase().endsWith('.pdf') ? (
                    <a href={n.url} target="_blank" rel="noreferrer" className="block p-4 text-blue-600">Open PDF</a>
                  ) : (
                    <img src={n.url} alt={n.name} className="w-full h-full object-cover aspect-square" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Reports Section */}
      <section id="reports" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">Reports</h2>
          </div>
          {isAdmin && (
            <Dialog open={openReport} onOpenChange={setOpenReport}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Report (PDF or PPT)</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportName">Report Name</Label>
                    <Input
                      id="reportName"
                      type="text"
                      placeholder="e.g., Day 1 Summary"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report">File</Label>
                    <Input
                      id="report"
                      type="file"
                      accept="application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                      onChange={(e) => setFileReport(e.target.files?.[0] || null)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!fileReport || uploading}
                    onClick={async () => {
                      const url = await uploadToFolder('reports', fileReport, { displayName: reportName || fileReport!.name });
                      if (url) {
                        // Refresh list to compute size and parse display name
                        const r = await listFromStorage('reports');
                        setReports(r);
                        setOpenReport(false);
                        setFileReport(null);
                        setReportName('');
                        toast({ title: 'Success', description: 'Report uploaded successfully' });
                      }
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        {loadingReports ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
              <p className="text-muted-foreground">PDFs and written reports will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((r) => {
              const name = r.displayName ? `${r.displayName}.${r.extension || ''}`.replace(/\.$/, '') : r.name;
              const size = formatBytes(r.sizeBytes);
              const type = getTypeLabel(r.extension);
              return (
                <div key={r.url} className="rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                  <div className="p-4 flex items-start gap-3">
                    <div className="shrink-0 bg-gray-100 rounded-md p-2 dark:bg-gray-700">
                      <FileText className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium truncate" title={name}>{name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{[size, type].filter(Boolean).join(', ')}</div>
                    </div>
                  </div>
                  <div className="px-4 pb-4 flex gap-3">
                    <a href={r.url} target="_blank" rel="noreferrer" className="flex-1">
                      <Button className="w-full" variant="secondary">Open</Button>
                    </a>
                    <a href={r.url} download className="flex-1">
                      <Button className="w-full" variant="outline">Save as...</Button>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
