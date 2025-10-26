import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Shield } from 'lucide-react';

export default function Profile() {
  const { profile, userRole } = useAuth();

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'default',
      junior_admin: 'secondary',
      student: 'outline',
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants] || 'outline'}>
        {role.replace('_', ' ')}
      </Badge>
    );
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-20 pb-20 md:pt-8 md:pb-8">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="h-16 w-16 text-2xl font-bold bg-gradient-to-br from-primary to-secondary">
                {profile.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{profile.full_name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                {userRole && getRoleBadge(userRole)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-sm font-medium">Full Name</div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{profile.full_name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Email</div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Phone Number</div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profile.phone || 'Not provided'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Role</div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{userRole?.replace('_', ' ')}</p>
                  <p className="text-xs text-muted-foreground">
                    Contact an administrator to change your role
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}