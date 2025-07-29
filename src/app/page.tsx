'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user, appUser, loading, signIn } = useAuth();
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isLogging, setIsLogging] = useState(false);
  const [error, setError] = useState<string>('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user && appUser) {
      const roleRoutes = {
        'Administrator': '/administrator',
        'Billing Administrator': '/billing-administrator', 
        'Supervisor': '/supervisor',
        'Practitioner': '/practitioner'
      };
      
      const route = roleRoutes[appUser.role as keyof typeof roleRoutes];
      if (route) {
        router.push(route);
      }
    }
  }, [user, appUser, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLogging(true);
    setError('');

    try {
      const { data, error: signInError } = await signIn(credentials.email, credentials.password);
      
      if (signInError) {
        setError(signInError.message || 'Login failed');
      } else if (data?.user) {
        // Redirect will happen via useEffect when appUser is loaded
      }
    } catch (_err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLogging(false);
    }
  };

  // User roles for selection
  const userRoles = [
    'Administrator',
    'Billing Administrator', 
    'Supervisor',
    'Practitioner'
  ];

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    // Clear credentials when selecting a role so user must enter manually
    setCredentials({ email: '', password: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Login</h1>
          <p className="text-gray-600 mb-8">Select your account type and sign in to continue</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Account Type</h3>
              <div className="space-y-3">
                {userRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`flex items-center p-4 w-full border-2 rounded-lg transition-colors group text-left ${
                      selectedRole === role 
                        ? 'border-teal-400 bg-teal-50' 
                        : 'border-gray-200 hover:border-teal-400 hover:bg-teal-50'
                    }`}
                  >
                    <div className={`w-4 h-4 border-2 rounded-full mr-4 ${
                      selectedRole === role
                        ? 'border-teal-400 bg-teal-400'
                        : 'border-gray-400 group-hover:border-teal-400'
                    }`}></div>
                    <div>
                      <div className="font-semibold text-gray-800">{role}</div>
                      <div className="text-sm text-gray-600">
                        {role === 'Administrator' && 'Full system access and management'}
                        {role === 'Practitioner' && 'Clinical services and student management'}
                        {role === 'Supervisor' && 'Oversight and approval workflows'}
                        {role === 'Billing Administrator' && 'Financial management and billing oversight'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Login Credentials Section */}
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Username or Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your username or email"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isLogging || !selectedRole}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLogging ? 'Logging In...' : 'Log In'}
              </button>

              
              <div className="text-center">
                <a href="#" className="text-sm text-teal-600 hover:text-teal-700 hover:underline">
                  forgot password?
                </a>
              </div>
              
              <div className="text-center">
                <span className="text-sm text-gray-500">or </span>
                <a href="#" className="text-sm text-teal-600 hover:text-teal-700 hover:underline">
                  access quickly
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Right side - Branding */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-sm">
            <div className="mb-6">
              <div className="text-4xl font-bold">
                <span className="text-red-500">+</span>
                <span className="text-teal-500">EDU</span>
              </div>
              <div className="text-2xl font-light text-green-500 -mt-2">claim</div>
              <div className="text-xs text-gray-500 mt-1">Kern Integrated Data Systems</div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to EDUclaim</h2>
            <p className="text-gray-600 text-sm">Streamlined educational service management</p>
          </div>
        </div>
      </div>
    </div>
  );
}
