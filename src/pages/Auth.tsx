import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { user, signUp, signIn, signInWithGoogle } = useAuth();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const redirectTo = searchParams.get('redirect') || '/home';

  useEffect(() => {
    if (user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, redirectTo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (!error) navigate(redirectTo, { replace: true });
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (!error) navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (!error) navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error('Google authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Side - Enhanced Image with Professional Overlay */}
      <div className="hidden lg:flex w-full lg:w-1/2 relative bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-90 transition-opacity duration-300"
          style={{
            backgroundImage: "url('https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/AUTH%20IMAGE.jpeg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Subtle Gradient Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-gray-900/30 to-black/50 dark:from-gray-900/80 dark:via-gray-900/40 dark:to-black/60"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">Welcome to Kala Kranthi</h1>
            <p className="text-lg lg:text-xl opacity-90 leading-relaxed max-w-md">
              Join our vibrant community of art enthusiasts. Showcase your creativity, connect with fellow artists, and participate in exclusive events and exhibitions.
            </p>
          </div>
          
          {/* Benefits Section */}
          <div className="mt-12">
            <div className="flex items-center mb-8">
              <div className="h-px bg-white/30 w-16"></div>
              <span className="mx-4 text-sm font-medium uppercase tracking-wider">Discover the Benefits</span>
              <div className="h-px bg-white/30 w-16"></div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-lg flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-sm">Exclusive Events</span>
                  <p className="text-xs opacity-80 mt-1">Access premier art showcases and workshops</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-lg flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-sm">Artist Network</span>
                  <p className="text-xs opacity-80 mt-1">Connect with global creatives</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-lg flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-sm">Showcase Work</span>
                  <p className="text-xs opacity-80 mt-1">Feature your portfolio publicly</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-lg flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-sm">Inspiring Workshops</span>
                  <p className="text-xs opacity-80 mt-1">Hone your skills with experts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-background">
        <div className="w-full max-w-md -mt-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-muted-foreground">
              {isLogin ? 'Sign in to continue to your account' : 'Join us to get started'}
            </p>
          </div>

          {/* Form - Wrapped in Card for Professional Look */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-6 lg:p-8 space-y-6">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  {!isLogin && (
                    <div className="grid gap-2">
                      <Label htmlFor="fullName" className="text-foreground">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="fullName"
                          name="fullName"
                          type="text"
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="pl-10"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-foreground">
                        Password
                      </Label>
                      {isLogin && (
                        <Link
                          to="/forgot-password"
                          className="text-sm font-medium text-primary hover:text-primary/80"
                        >
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={isLogin ? '••••••••' : 'At least 8 characters'}
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Social Login - Enhanced Divider and Buttons */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center space-x-2 border-border bg-background hover:bg-accent/50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-foreground">Continue with Google</span>
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFormData({ email: '', password: '', fullName: '' });
                  }}
                  className="font-medium text-primary hover:text-primary/80 focus:outline-none"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
