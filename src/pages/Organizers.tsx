import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { People, Sms, Call, Location, Mobile, SmsEdit, CallAdd, DirectInbox, CallRemove, DirectSend, DirectNormal, Profile2User, ProfileAdd, ProfileCircle, ProfileTick } from 'iconsax-react';

type Organizer = {
  id: number;
  name: string;
  role: string | string[];
  department?: string;
  image?: string;
  email?: string;
  phone?: string;
  place?: string;
};

export default function Organizers() {
  // GGU Leaders data
  const gguLeaders: Organizer[] = [
    {
      id: 1,
      name: 'Dr. U. Chandra Sekhar',
      role: 'Vice Chancellor',
      department: 'Godavari Global University',
      image: 'https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/Screenshot%202025-10-27%20110753.png',
    },
    {
      id: 2,
      name: 'Sri K.V.V. Satyanarayana Raju',
      role: 'Chairman of GGU & GIET Institutions',
      department: 'Godavari Global University',
      image: 'https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/Screenshot%202025-10-27%20111015.png',
    },
    {
      id: 3,
      name: 'K. Sasi Kiran Varma',
      role: 'Pro-Chancellor of GGU',
      department: 'Godavari Global University',
      image: 'https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/ProChancellor2.jpg',
    }
  ];

  // Official organizers data
  const officials: Organizer[] = [
    {
      id: 1,
      name: 'Dr. E. Nirmala Devi',
      role: 'Professor & Dept of MECH',
      department: 'Godavari Global University',
      image: 'https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/WhatsApp%20Image%202025-10-25%20at%2015.48.40_ffb62d43.jpg',
      email: 'nirmala.mech@ggu.ac.in',
      phone: '+91 9876543212',
      place: 'Rajahmundry, AP'
    },
    {
      id: 2,
      name: 'Dr. Y. Muralidhar Reddy',
      role: 'Director Innovation and Incubation Cell',
      department: 'Godavari Global University',
      image: 'https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/Picture1.jpg',
      email: 'director.iic@ggu.ac.in',
      phone: '+91 9876543210',
      place: 'Rajahmundry, AP'
    },
    {
      id: 3,
      name: 'Dr. K. Valli Madhavi',
      role: 'Principal of GIET',
      department: 'Godavari Global University',
      image: 'https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/Picture2.jpg',
      email: 'principal.giet@ggu.ac.in',
      phone: '+91 9876543211',
      place: 'Rajahmundry, AP'
    },
    
  ];

  // Student organizers data
  const studentOrganizers: Organizer[] = [
    {
      id: 1,
      name: 'Sivamanikanta Mallipurapu',
      role: ['Organizer Head', 'Student President'],
      department: 'B.Tech CSE, 2nd Year',
      image: 'https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/Picture5.png',
      email: 'siva.cse22@ggu.ac.in',
      phone: '+91 9876543213',
      place: 'Rajahmundry, AP'
    },
    {
      id: 2,
      name: 'Shaik Gafur Anaruddin',
      role: 'Co Organizer',
      department: 'B.Tech CSE, 2nd Year',
      image: 'https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/Picture6%20(1).png',
      email: 'gafur.cse22@ggu.ac.in',
      phone: '+91 9876543214',
      place: 'Rajahmundry, AP'
    },
    {
      id: 3,
      name: 'Lakshmi Satya Sri Sirangula',
      role: 'Technical Head',
      department: 'B.Tech CSE, 2nd Year',
      image: 'https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/Picture7.jpg',
      email: 'lakshmisatyasris@gmail.com',
      phone: '+91 7702013024',
      place: 'Angara, AP'
    },
    {
      id: 4,
      name: 'R.Y.B.Ajith',
      role: 'Marketing Head',
      department: 'B.Tech CSE, 2nd Year',
      image: 'https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/WhatsApp%20Image%202025-10-26%20at%2013.35.16_33dee01e.jpg',
      email: 'ajithrelangi6@gmail.com',
      phone: '+91 8332026999',
      place: 'Rajahmundry, AP'
    },
    {
      id: 5,
      name: 'G.V.S.S.Vindhya sree',
      role: 'Stalls Head',
      department: 'B.Tech IT, 3rd Year',
      image: 'https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/vinni.jpg',
      email: 'vindhyavini00@gmail.com',
      phone: '+91 6301119448',
      place: 'Rajahmundry, AP'
    },
    {
      id: 6,
      name: 'Pavan Kumar Swamy S',
      role: 'Publicity Head',
      department: 'B.Tech CSE, 3rd Year',
      image: 'https://1.gravatar.com/avatar/780a92c3c5a3106438ae8233411473df8ac2da61d78012c2494d9cd15953e67c?size=1024&d=initials',
      email: 'shesettipavankumarswamy@gmail.com',
      phone: '+91 8639122823',
      place: 'Rajahmundry, AP'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-10 md:py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <People className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Meet Our Organizers</h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
          The dedicated team behind Kala Kranti Start-up Mela, driving innovation and collaboration.
        </p>
      </div>

      {/* GGU Leaders Section */}
      <section className="mb-16">
        <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center">Organized with the Blessings and Support of GGU Leaders</h2>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl w-full">
            {gguLeaders.map((leader, index) => (
              <Card
                key={`leader-${index}`}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900 dark:to-pink-800 min-w-[250px] md:min-w-[300px]"
              >
                <CardHeader className="items-center p-4 sm:p-6">
                  <Avatar className="h-24 w-24 md:h-28 md:w-28 mb-4 group-hover:scale-105 transition-transform">
                    {leader.image ? (
                      <AvatarImage src={leader.image} alt={leader.name} className="object-cover" />
                    ) : (
                      <AvatarFallback className="text-lg md:text-xl bg-pink-200 dark:bg-pink-700">
                        {leader.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <CardTitle className="text-base md:text-lg text-center line-clamp-1">
                    {leader.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  <Badge
                    variant="default"
                    className="w-fit mx-auto text-xs md:text-sm px-3 py-1 bg-gradient-to-r from-pink-500 to-pink-600"
                  >
                    {leader.role}
                  </Badge>
                  {leader.department && (
                    <CardDescription className="text-xs md:text-sm line-clamp-2">
                      {leader.department}
                    </CardDescription>
                  )}
                  <div className="flex gap-3 justify-center pt-3 mt-3 border-t border-pink-100 dark:border-pink-700">
                    {leader.email && (
                      <a 
                        href={`mailto:${leader.email}`} 
                        className="text-pink-600 dark:text-pink-300 hover:text-pink-700 dark:hover:text-pink-200 transition-colors"
                        title={leader.email}
                      >
                        <DirectInbox size={18} variant="Bold" />
                      </a>
                    )}
                    {leader.phone && (
                      <a 
                        href={`tel:${leader.phone.replace(/[^0-9+]/g, '')}`} 
                        className="text-pink-600 dark:text-pink-300 hover:text-pink-700 dark:hover:text-pink-200 transition-colors"
                        title={leader.phone}
                      >
                        <CallAdd size={18} variant="Bold" />
                      </a>
                    )}
                    {leader.place && (
                      <span className="text-pink-600 dark:text-pink-300" title={leader.place}>
                        <Location size={18} variant="Bold" />
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Official Organizers Section */}
      <section className="mb-16">
        <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center">Official Organizers</h2>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl w-full">
            {officials.map((official) => (
              <Card
                key={official.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 min-w-[250px] md:min-w-[300px]"
              >
                <CardHeader className="items-center p-4 sm:p-6">
                  <Avatar className="h-24 w-24 md:h-28 md:w-28 mb-4 group-hover:scale-105 transition-transform">
                    {official.image ? (
                      <AvatarImage src={official.image} alt={official.name} className="object-cover" />
                    ) : (
                      <AvatarFallback className="text-lg md:text-xl bg-pink-200 dark:bg-pink-700">
                        {official.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <CardTitle className="text-base md:text-lg text-center line-clamp-1">
                    {official.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  <Badge
                    variant="default"
                    className="w-fit mx-auto text-xs md:text-sm px-3 py-1 bg-gradient-to-r from-pink-500 to-pink-600"
                  >
                    {official.role}
                  </Badge>
                  {official.department && (
                    <CardDescription className="text-xs md:text-sm line-clamp-2">
                      {official.department}
                    </CardDescription>
                  )}
                  <div className="flex gap-3 justify-center pt-3 mt-3 border-t border-pink-100 dark:border-pink-700">
                    {official.email && (
                      <a 
                        href={`mailto:${official.email}`} 
                        className="text-pink-600 dark:text-pink-300 hover:text-pink-700 dark:hover:text-pink-200 transition-colors"
                        title={official.email}
                      >
                        <DirectInbox size={18} variant="Bold" />
                      </a>
                    )}
                    {official.phone && (
                      <a 
                        href={`tel:${official.phone.replace(/[^0-9+]/g, '')}`} 
                        className="text-pink-600 dark:text-pink-300 hover:text-pink-700 dark:hover:text-pink-200 transition-colors"
                        title={official.phone}
                      >
                        <CallAdd size={18} variant="Bold" />
                      </a>
                    )}
                    {official.place && (
                      <span className="text-blue-600 dark:text-blue-300" title={official.place}>
                        <Location size={18} variant="Bold" />
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Student Organizers Section */}
      <section>
        <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center flex items-center justify-center gap-2">
          <People className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          Student Organizing Committee
        </h2>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl w-full">
            {studentOrganizers.map((student) => (
              <Card
                key={student.id}
                className="group hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white dark:bg-gray-800 min-w-[200px] md:min-w-[280px]"
              >
                <CardHeader className="flex flex-row items-center gap-3 sm:gap-4 p-4 sm:p-6">
                  <div className="relative h-20 w-20 md:h-24 md:w-24 mb-3 group-hover:scale-105 transition-transform">
                    <Avatar className="h-full w-full">
                      {student.image ? (
                        <AvatarImage 
                          src={student.image} 
                          alt={student.name} 
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <AvatarFallback className="text-sm md:text-base bg-pink-100 dark:bg-pink-900 w-full h-full flex items-center justify-center avatar-fallback">
                        {student.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-base md:text-lg line-clamp-1">{student.name}</CardTitle>
                    <div className="flex flex-col gap-1">
                      {Array.isArray(student.role) ? (
                        student.role.map((role, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs md:text-sm w-fit bg-gradient-to-r from-pink-300 to-pink-400 text-white"
                          >
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs md:text-sm w-fit bg-gradient-to-r from-pink-300 to-pink-400 text-white"
                        >
                          {student.role}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs md:text-sm line-clamp-1">
                      {student.department}
                    </CardDescription>
                    <div className="flex gap-4 justify-center pt-4 mt-3 border-t border-gray-100 dark:border-gray-700">
                      {student.email && (
                        <a 
                          href={`mailto:${student.email}`} 
                          className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title={student.email}
                        >
                          <DirectSend size={16} variant="Bold" />
                        </a>
                      )}
                      {student.phone && (
                        <a 
                          href={`tel:${student.phone.replace(/[^0-9+]/g, '')}`} 
                          className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title={student.phone}
                        >
                          <CallRemove size={16} variant="Bold" />
                        </a>
                      )}
                      {student.place && (
                        <span className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" title={student.place}>
                          <Location size={16} variant="Bold" />
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}