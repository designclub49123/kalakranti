import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { user, signUp, signIn, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

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
        if (!error) navigate('/home');
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (!error) navigate('/home');
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
      if (!error) navigate('/home');
    } catch (error) {
      console.error('Google authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Enhanced Image with Professional Overlay */}
      <div className="hidden lg:flex w-full lg:w-1/2 relative bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Background Image - Switched to a reliable Unsplash abstract art image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-90 transition-opacity duration-300"
          style={{
            backgroundImage: "url('https://bhalrlrwbfdfqcnmgcsa.supabase.co/storage/v1/object/public/gallery/AUTH%20IMAGE.jpeg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Subtle Gradient Overlay for Readability - Adjusted for better visibility */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-transparent to-black/40"></div>
        </div>
        
        {/* Content - Improved Typography and Spacing */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">Welcome to Kala Kranthi</h1>
            <p className="text-lg lg:text-xl opacity-95 leading-relaxed max-w-md">
              Join our vibrant community of art enthusiasts. Showcase your creativity, connect with fellow artists, and participate in exclusive events and exhibitions.
            </p>
          </div>
          
          {/* Enhanced Benefits Section */}
          <div className="mt-12">
            <div className="flex items-center mb-8">
              <div className="h-px bg-white/20 w-24"></div>
              <span className="mx-6 text-sm font-medium uppercase tracking-wide">Discover the Benefits</span>
              <div className="h-px bg-white/20 w-24"></div>
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

      {/* Right Side - Professional Form Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8 bg-gray-50 lg:bg-white min-h-screen lg:min-h-full">
        <div className="w-full max-w-md space-y-8">
          {/* Header - Centered and Polished */}
          <div className="text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Join Kala Kranthi'}
            </h2>
            <p className="text-gray-600">
              {isLogin ? "Don't have an account? " : 'Already a member? '}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {isLogin ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Form - Wrapped in Card for Professional Look */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-6 lg:p-8 space-y-6">
              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="pl-10 h-11"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                    {isLogin && (
                      <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {!isLogin && (
                    <p className="text-xs text-gray-500">
                      • At least 8 characters<br />
                      • Mix of letters, numbers & symbols
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <Button type="submit" className="w-full h-11 text-sm font-medium" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isLogin ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : isLogin ? (
                      'Sign In'
                    ) : (
                      'Sign Up'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Social Login - Enhanced Divider and Buttons */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              type="button" 
              onClick={handleGoogleSignIn}
              className="w-full h-11 border-gray-200 hover:border-gray-300 text-sm" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}