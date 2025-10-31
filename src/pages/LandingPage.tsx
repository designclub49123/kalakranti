import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import IconsaxIcon from '@/components/ui/IconsaxIcon';
import { useEffect, useState } from 'react';
import SocialIcons from '@/components/ui/SocialIcons';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: 'Calendar',
    iconColor: 'text-red-400 dark:text-red-300',
    title: 'Event Management',
    description: 'Easily create, manage, and track your events in one place.',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900/30',
    borderColor: 'border-red-200 dark:border-red-800/50'
  },
  {
    icon: 'Category',
    iconColor: 'text-blue-400 dark:text-blue-300',
    title: 'Quick Registration',
    description: 'Simple and fast registration process for all events.',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800/50'
  },
  {
    icon: 'People',
    iconColor: 'text-red-400 dark:text-red-300',
    title: 'Community',
    description: 'Connect with other students and organizers.',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900/30',
    borderColor: 'border-red-200 dark:border-red-800/50'
  },
  {
    icon: 'Award',
    iconColor: 'text-blue-400 dark:text-blue-300',
    title: 'Achievements',
    description: 'Track your participation and earn recognition.',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800/50'
  }
];

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  category: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    timeZone: 'Asia/Kolkata' 
  };
  return new Date(dateString).toLocaleDateString('en-IN', options).toUpperCase();
};

const testimonials = [
  {
      id: 1,
      name: 'Dr. E. Nirmala Devi',
      role: 'Professor & Dept of MECH',
      quote: "Kala Kranthi made event registration so seamless. I discovered amazing stalls and connected with like-minded peers!",
      avatar: 'https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/WhatsApp%20Image%202025-10-25%20at%2015.48.40_ffb62d43.jpg',
      rating: 5
    },
    {
      id: 2,
      name: 'Dr. Y. Muralidhar Reddy',
      role: 'Director Innovation and Incubation Cell',
      quote: "The platform is user-friendly and the event management tools are top-notch. Highly recommend for campus life!",
      avatar: 'https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/Picture1.jpg',
      rating: 5
    },
    {
      id: 3,
      name: 'Dr. K. Valli Madhavi',
      role: 'Principal of GIET',
      quote: "Managing stalls and approvals has never been easier. Kala Kranthi truly revolutionizes campus events.",
      avatar: 'https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/Picture2.jpg',
      rating: 5
    },
];

const stats = [
  { label: 'Happy Students', value: '5,000+' },
  { label: 'Events Hosted', value: '150+' },
  { label: 'Certificates Issued', value: '10,000+' },
  { label: 'Active Organizers', value: '200+' }
];

const whyChooseUsFeatures = [
  {
    iconName: 'AddCircle',
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100/80 dark:bg-blue-900/30',
    title: 'Easy Registration',
    description: 'Quick and simple stall registration process for any event with just a few clicks.'
  },
  {
    iconName: 'People',
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100/80 dark:bg-purple-900/30',
    title: 'Team Management',
    description: 'Easily manage your team members, roles, and permissions in one place.'
  },
  {
    iconName: 'Award',
    iconColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100/80 dark:bg-red-900/30',
    title: 'Earn Recognition',
    description: 'Receive digital certificates and badges for your participation and achievements.'
  },
  {
    iconName: 'Category',
    iconColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100/80 dark:bg-green-900/30',
    title: 'Seamless Access',
    description: 'Instant access to all your event details, schedules, and resources in one place.'
  },
  {
    iconName: 'TickCircle',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100/80 dark:bg-yellow-900/30',
    title: 'Quick Approvals',
    description: 'Streamlined approval process with real-time updates on your applications.'
  },
  {
    iconName: 'Chart',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100/80 dark:bg-indigo-900/30',
    title: 'Analytics Dashboard',
    description: 'Track your event performance and engagement with detailed analytics.'
  }
];

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  type Leader = {
    id: number;
    name: string;
    role: string | string[];
    department?: string;
    image?: string;
    email?: string;
    phone?: string;
    place?: string;
  };

  // GGU Leaders data (same as Organizers page)
  const gguLeaders: Leader[] = [
    {
      id: 1,
      name: 'Sri K.V.V. Satyanarayana Raju',
      role: 'Chairman of GGU & GIET Institutions',
      department: 'Godavari Global University',
      image: 'https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/Screenshot%202025-10-27%20111015.png',
    },
    {
      id: 2,
      name: 'K. Sasi Kiran Varma',
      role: 'Pro-Chancellor of GGU',
      department: 'Godavari Global University',
      image: 'https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/ProChancellor2.jpg',
    },
    {
      id: 3,
      name: 'Dr. U. Chandra Sekhar',
      role: 'Vice Chancellor',
      department: 'Godavari Global University',
      image: 'https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/Screenshot%202025-10-27%20110753.png',
    },
  ];

  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true })
          .limit(3);

        if (fetchError) throw fetchError;
        
        if (data) {
          setEvents(data);
        }
      } catch (err) {
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setGalleryLoading(true);
        
        // First, get the list of gallery items with their metadata
        const { data: galleryItems, error: galleryError } = await supabase
          .from('gallery')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(8);

        if (galleryError) throw galleryError;
        
        if (galleryItems && galleryItems.length > 0) {
          // Process each item to ensure we have the correct public URL
          const processedItems = await Promise.all(galleryItems.map(async (item) => {
            if (!item.image_url) return item;
            
            // If the URL is already a full URL, use it as is
            if (item.image_url.startsWith('http')) {
              return item;
            }
            
            // Otherwise, try to get the public URL from Supabase Storage
            try {
              // Extract the file path from the URL if it's a storage path
              const pathParts = item.image_url.split('/');
              const bucket = pathParts[1];
              const filePath = pathParts.slice(2).join('/');
              
              const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);
                
              return {
                ...item,
                image_url: publicUrl || item.image_url
              };
            } catch (error) {
              console.error('Error processing image URL:', error);
              return item; // Return the original item if there's an error
            }
          }));
          
          setGalleryImages(processedItems);
        }
      } catch (error) {
        console.error('Error fetching gallery:', error);
        toast.error('Failed to load gallery images');
      } finally {
        setGalleryLoading(false);
      }
    };

    fetchGallery();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 pt-20 sm:pt-24">
      {/* Navigation - Non-sticky for landing page */}
      <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-100/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img 
                  src="https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/Screenshot%202025-10-11%20222523.png" 
                  alt="Kala kranti Logo" 
                  className="h-8 w-auto sm:h-10 transition-all duration-300"
                />
                <h1>by</h1>
                <img 
                  src="https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/ggu-logo%20(1).png" 
                  alt="GGU Logo" 
                  className="h-8 w-auto sm:h-10 transition-all duration-300"
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium">Home</a>
              <a href="#events" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium">Events</a>
              <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium">Testimonials</a>
              <a href="#about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium">About</a>
              <a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium">Contact</a>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to="/auth">Log in</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-500 to-red-500 hover:from-blue-600 hover:to-red-600 shadow-lg text-white dark:from-blue-600 dark:to-red-600 dark:hover:from-blue-700 dark:hover:to-red-700">
                <Link to="/auth?mode=signup" className="flex items-center">
                  Sign up <IconsaxIcon name="ArrowRight2" className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow pb-16 md:pb-0">
        <section id="home" className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 pt-8 pb-12 sm:pt-16 sm:pb-20 md:py-32 px-4">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+')]" />
          </div>
          <div className="relative max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center md:text-left"
              >
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-red-100 dark:from-blue-900/30 dark:to-red-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6 shadow-sm border border-blue-100 dark:border-blue-800/50">
                  <IconsaxIcon name="Award" className="h-4 w-4 mr-2" />
                  Join 5,000+ Happy Students
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  Experience the Best <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Campus Events</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto md:mx-0 mb-10 leading-relaxed">
                  Discover, register, and manage event stalls with ease. Join thousands of students and organizers in creating memorable experiences at Godavari Global University.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Button size="lg" className="text-lg py-6 px-8 bg-gradient-to-r from-blue-500 to-red-500 hover:from-blue-600 hover:to-red-600 shadow-lg text-white dark:from-blue-600 dark:to-red-600 dark:hover:from-blue-700 dark:hover:to-red-700" asChild>
                    <Link to="/auth?mode=signup" className="flex items-center">
                      Get Started Now
                      <IconsaxIcon name="ArrowRight2" className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg py-6 px-8 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20" asChild>
                    <Link to="/events" className="flex items-center">
                      <IconsaxIcon name="Calendar" className="mr-2 h-5 w-5" />
                      Browse Events
                    </Link>
                  </Button>
                </div>
                
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/AUTH%20IMAGE.jpeg" 
                    alt="Campus Event"
                    className="w-full h-auto object-cover min-h-[500px]"
                  />
                </div>
                <div className="absolute -bottom-8 -left-6 bg-white/90 dark:bg-gray-800/95 backdrop-blur-sm p-6 rounded-xl shadow-xl z-20 w-72 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-500/10 dark:bg-blue-400/20 p-3 rounded-lg flex-shrink-0">
                      <IconsaxIcon name="Calendar" className="text-blue-600 dark:text-blue-300 h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Next Event</p>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Annual Tech Fest</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">14 NOV 2025</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-8 -right-6 bg-white/90 dark:bg-gray-800/95 backdrop-blur-sm p-6 rounded-xl shadow-xl z-20 w-72 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-500/10 dark:bg-purple-400/20 p-3 rounded-lg flex-shrink-0">
                      <IconsaxIcon name="People" className="text-purple-600 dark:text-purple-300 h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Participants</p>
                      <h4 className="font-semibold text-gray-900 dark:text-white">500+ Students</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Already Registered</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-r from-blue-50 to-red-50 dark:from-gray-800 dark:to-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="group"
                >
                  <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-blue-500 to-red-500 dark:from-blue-400 dark:to-red-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Amazing Features</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Everything you need to manage and enjoy campus events</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="group bg-white/80 dark:bg-gray-800/80 p-8 rounded-xl border border-blue-100/50 dark:border-blue-800/50 shadow-sm hover:shadow-xl hover:border-blue-200/50 dark:hover:border-blue-700/50 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                  whileHover={{ y: -4 }}
                >
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconsaxIcon name={feature.icon} className={`h-8 w-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* GGU Leaders Section - Clean theme for landing */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Organized with the Blessings and Support of GGU Leaders</h2>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-2">We’re grateful for the continued guidance and support</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center">
              {gguLeaders.map((leader, index) => (
                <Card
                  key={`leader-${index}`}
                  className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 w-full max-w-sm"
                >
                  <CardHeader className="items-center p-6">
                    <Avatar className="h-24 w-24 md:h-28 md:w-28 mb-4 group-hover:scale-105 transition-transform ring-4 ring-blue-100 dark:ring-blue-900/40">
                      {leader.image ? (
                        <AvatarImage src={leader.image} alt={leader.name} className="object-cover" />
                      ) : (
                        <AvatarFallback className="text-lg md:text-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
                          {leader.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <CardTitle className="text-base md:text-lg text-center line-clamp-1">
                      {leader.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-2 pb-6">
                    <Badge
                      variant="outline"
                      className="w-fit mx-auto text-xs md:text-sm px-3 py-1 border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-900/20"
                    >
                      {leader.role}
                    </Badge>
                    {leader.department && (
                      <CardDescription className="text-xs md:text-sm line-clamp-2 text-gray-500 dark:text-gray-400">
                        {leader.department}
                      </CardDescription>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section id="events" className="py-24 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Upcoming Events</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Don't miss these exciting events on campus</p>
            </motion.div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700">
                    <div className="h-48 bg-gray-100 dark:bg-gray-700 animate-pulse" />
                    <div className="p-6 space-y-3">
                      <div className="h-4 w-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-6 w-3/4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-10 w-full bg-gray-100 dark:bg-gray-700 rounded animate-pulse mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    whileHover={{ y: -8 }}
                  >
                    <div className="h-48 overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                      <img 
                        src={`https://source.unsplash.com/random/600x400/?event,${index + 1}`} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-400 to-red-400 text-white text-sm font-medium rounded-full shadow-sm">
                          {event.category}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{formatDate(event.date)}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{event.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6 flex items-center">
                        <IconsaxIcon name="Category" className="mr-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        {event.location}
                      </p>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-red-500 hover:from-blue-600 hover:to-red-600 shadow-md text-white dark:from-blue-600 dark:to-red-600 dark:hover:from-blue-700 dark:hover:to-red-700" asChild>
                        <Link to={`/events/${event.id}`} className="flex items-center justify-center">
                          Learn More
                          <IconsaxIcon name="ArrowRight2" className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No upcoming events</h3>
                <p className="text-gray-600 dark:text-gray-300">Please check back later for new events.</p>
              </div>
            )}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 text-center"
            >
              <Button variant="outline" size="lg" asChild className="border-gray-300 dark:border-gray-600 px-8 py-6">
                <Link to="/events" className="flex items-center mx-auto">
                  View All Events
                  <IconsaxIcon name="ArrowRight2" className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">What Our Organizers Say</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Hear from Organizers who love Kala Kranthi</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 relative"
                  whileHover={{ y: -4 }}
                >
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <IconsaxIcon
                        key={i}
                        name="Award"
                        className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="about" className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden dark:from-gray-800 dark:via-gray-700 dark:to-gray-600">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/AUTH%20IMAGE.jpeg')]" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
              <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">Join thousands of students and start exploring amazing events on campus today!</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300" 
                  asChild
                >
                  <Link to="/auth?mode=signup">
                    Create Free Account
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white text-white bg-blue-600/10 hover:bg-blue-600/20 backdrop-blur-sm px-8 py-6 text-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 dark:border-gray-300 dark:bg-gray-700/20 dark:hover:bg-gray-600/20" 
                  asChild
                >
                  <Link to="/contact" className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Contact Us
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4 dark:bg-blue-900/30 dark:text-blue-300">
                Why Choose Us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Experience the Difference</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Everything you need to make your event participation seamless and successful</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {whyChooseUsFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:shadow-blue-50 dark:hover:shadow-blue-900/20 transition-all duration-300 cursor-pointer text-center"
                  whileHover={{ y: -8 }}
                >
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <IconsaxIcon name={feature.iconName} className={`h-8 w-8 ${feature.iconColor}`} variant="Bold" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4 dark:bg-blue-900/30 dark:text-blue-300">
                Gallery
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Event Highlights</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Take a look at some memorable moments from our events</p>
            </motion.div>

            {galleryLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : galleryImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((image) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="group relative overflow-hidden rounded-xl aspect-square"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={image.image_url}
                      alt={image.caption || 'Event image'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        // If the image fails to load, try to get it directly from storage
                        const target = e.target as HTMLImageElement;
                        if (image.image_url && !image.image_url.startsWith('http')) {
                          const pathParts = image.image_url.split('/');
                          if (pathParts.length > 2) {
                            const bucket = pathParts[1];
                            const filePath = pathParts.slice(2).join('/');
                            const { data: { publicUrl } } = supabase.storage
                              .from(bucket)
                              .getPublicUrl(filePath);
                            if (publicUrl) {
                              target.src = publicUrl;
                            }
                          }
                        }
                      }}
                    />
                    {image.caption && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <p className="text-white text-sm font-medium">{image.caption}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <p className="text-gray-500 dark:text-gray-400">No gallery images available yet. Check back soon!</p>
              </div>
            )}

            <div className="mt-12 text-center">
              <Button
                asChild
                variant="outline"
                className="inline-flex items-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                <Link to="/gallery">
                  View Full Gallery
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-gray-950 text-white py-16 border-t border-gray-800 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div className="md:col-span-1">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Kala Kranthi
                </h3>
                <p className="text-gray-400 mb-6 leading-relaxed">Empowering students through amazing campus events and activities.</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { name: 'instagram', url: '#' },
                    { name: 'facebook', url: '#' },
                    
                    { name: 'youtube', url: '#' },
                   
                    { name: 'whatsapp', url: '#' }
                  ].map((social) => (
                    <a 
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-300 flex items-center justify-center hover:-translate-y-1 hover:shadow-lg group"
                      aria-label={social.name}
                      title={social.name.charAt(0).toUpperCase() + social.name.slice(1)}
                    >
                      <SocialIcons 
                        name={social.name} 
                        className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors"
                      />
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider mb-6 text-gray-300">Quick Links</h4>
                <ul className="space-y-3">
                  {['Home', 'Events', 'About', 'Contact'].map((item) => (
                    <li key={item}>
                      <a href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-white transition-colors duration-200 block py-1">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider mb-6 text-gray-300">Support</h4>
                <ul className="space-y-3">
                  {['Help Center', 'Terms of Service', 'Privacy Policy', 'FAQ'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 block py-1">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider mb-6 text-gray-300">Contact Us</h4>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-start">
                    <IconsaxIcon name="Category" className="h-5 w-5 mr-3 mt-1 flex-shrink-0 text-blue-400" />
                    <span>Godavari Global University , Rajamundry</span>
                  </li>
                  <li className="flex items-center">
                    <IconsaxIcon name="Message" className="h-5 w-5 mr-3 text-green-400" />
                    <span>info@ggu.edu.in</span>
                  </li>
                  <li className="flex items-center">
                    <IconsaxIcon name="MessageText1" className="h-5 w-5 mr-3 text-purple-400" />
                    <span>+91 9849497911</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 dark:border-gray-700 pt-8 text-center text-gray-400 text-sm">
              <p>&copy; 2025 Kala Kranthi | Godavari Global University. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}