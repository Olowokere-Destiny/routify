"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { CloudUpload, Loader2, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Point } from "../../lib/types/map";

interface AuthDialogProps {
  points: Point[]; // Actual points array to save
}

type ViewType = 'login' | 'register' | 'save';

export default function AuthDialog({ points }: AuthDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ViewType>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [routeName, setRouteName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rateLimitTime, setRateLimitTime] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Check login status on mount and when dialog opens
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token && user) {
        setIsLoggedIn(true);
        setUserEmail(JSON.parse(user).email);
        setView('save');
      } else {
        setIsLoggedIn(false);
        setView('login');
      }
    }
  }, [isOpen]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRouteName("");
    setError("");
    setSuccess("");
  };

  const switchView = (newView: ViewType) => {
    setView(newView);
    resetForm();
    setRateLimitTime(0);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsLoggedIn(true);
        setUserEmail(data.user.email);
        setSuccess('Login successful!');
        setTimeout(() => {
          setView('save');
          setSuccess("");
        }, 1000);
      } else {
        if (response.status === 429) {
          setRateLimitTime(data.remainingTime || 30);
        }
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsLoggedIn(true);
        setUserEmail(data.user.email);
        setSuccess('Account created successfully!');
        setTimeout(() => {
          setView('save');
          setSuccess("");
        }, 1000);
      } else {
        if (response.status === 429) {
          setRateLimitTime(data.remainingTime || 30);
        }
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/routes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: routeName,
          points: points,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Route saved to cloud successfully!');
        setTimeout(() => {
          setIsOpen(false);
          resetForm();
        }, 2000);
      } else {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsLoggedIn(false);
          setError('Session expired. Please log in again.');
          setTimeout(() => {
            setView('login');
          }, 2000);
        } else if (response.status === 429) {
          setRateLimitTime(data.remainingTime || 60);
          setError(data.error || 'Too many requests');
        } else {
          setError(data.error || 'Failed to save route');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserEmail("");
    setSuccess('Logged out successfully!');
    setTimeout(() => {
      setIsOpen(false);
      resetForm();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          disabled={points.length === 0}
          variant="ghost"
          className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600"
          title="Cloud sync"
        >
          <CloudUpload className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {view === 'login' && 'Log In'}
            {view === 'register' && 'Create Account'}
            {view === 'save' && 'Save Route to Cloud'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {view === 'login' && 'Log in to save your routes to the cloud'}
            {view === 'register' && 'Create an account to save unlimited routes'}
            {view === 'save' && `Save your route with ${points.length} points`}
          </DialogDescription>
        </DialogHeader>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
            {rateLimitTime > 0 && (
              <span className="block mt-1 font-semibold">
                Try again in {rateLimitTime} seconds
              </span>
            )}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            {success}
          </div>
        )}

        {/* Login Form */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-10"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </Button>

            <div className="border-t pt-4">
              <p className="text-sm text-center text-gray-600">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchView('register')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  disabled={loading}
                >
                  Create one
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Register Form */}
        {view === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-10"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <div className="border-t pt-4">
              <p className="text-sm text-center text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  disabled={loading}
                >
                  Log in
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Save Route Form */}
        {view === 'save' && (
          <form onSubmit={handleSaveRoute} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="route-name" className="text-sm font-medium text-gray-700">
                Route Name
              </Label>
              <Input
                id="route-name"
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="e.g. Morning run route"
                className="h-10"
                required
                disabled={loading}
                maxLength={100}
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-3 text-sm text-gray-700">
              <p className="font-semibold">{points.length} points will be saved</p>
              <p className="text-xs text-gray-600 mt-1">Logged in as: {userEmail}</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving to cloud...
                </>
              ) : (
                <>
                  <CloudUpload className="mr-2 h-4 w-4" />
                  Save to Cloud
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              variant="outline"
              className="w-full h-9 text-sm text-gray-600 hover:text-gray-900"
            >
              <LogOut className="mr-2 h-3 w-3" />
              Log Out
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}