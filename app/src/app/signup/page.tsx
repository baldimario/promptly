'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    const fieldName = id.replace('-', ''); // Convert first-name to firstName
    setFormData(prev => ({
      ...prev,
      [fieldName]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { firstName, lastName, email, password, agreeToTerms } = formData;
    
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // In a real app, we would make an API call to create the user account
      // For now, we'll simulate success and then sign in the user
      
      // This is a placeholder for API call to create an account
      // await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name: `${firstName} ${lastName}`, email, password })
      // });
      
      // For demo purposes, we'll just sign in directly
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        name: `${firstName} ${lastName}`
      });

      if (result?.error) {
        setError('Registration failed. Please try again.');
        return;
      }

      // Redirect to homepage on success
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Registration error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: '/' });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-text text-3xl font-black leading-tight tracking-[-0.033em]">
            Create an account
          </h1>
          <p className="text-text-muted text-sm mt-2">
            Join Promptly to discover and share amazing AI prompts
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-text text-sm font-medium">
                First name
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-xl text-text focus:outline-0 focus:ring-0 border border-border bg-background focus:border-primary h-12 px-4"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-text text-sm font-medium">
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-xl text-text focus:outline-0 focus:ring-0 border border-border bg-background focus:border-primary h-12 px-4"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-text text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-xl text-text focus:outline-0 focus:ring-0 border border-border bg-background focus:border-primary h-12 px-4"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-text text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-xl text-text focus:outline-0 focus:ring-0 border border-border bg-background focus:border-primary h-12 px-4"
              required
            />
            <p className="text-text-muted text-xs">
              Must be at least 8 characters with 1 number and 1 special character.
            </p>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                required
              />
            </div>
            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-text-muted">
              I agree to the{' '}
              <Link href="/terms" className="accent-link">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="accent-link">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            variant="accent"
            size="lg"
            fullWidth
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-4 text-text-muted">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleSocialSignIn('google')}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 hover:bg-background/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            <span className="text-text text-sm font-medium">Google</span>
          </button>
          <button
            type="button"
            onClick={() => handleSocialSignIn('github')}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 hover:bg-background/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.48 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.022A9.606 9.606 0 0 1 12 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.378.202 2.397.1 2.65.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.933.359.309.678.917.678 1.852 0 1.335-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.167 22 16.42 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            <span className="text-text text-sm font-medium">GitHub</span>
          </button>
        </div>

        <p className="text-center text-text-muted text-sm">
          Already have an account?{' '}
          <Link href="/login" className="accent-link font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
