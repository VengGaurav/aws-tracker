import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, Lock, User, Chrome, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Validation functions
  const validateName = (value) => {
    const errors = [];
    if (value.length < 3) errors.push('Name must be at least 3 characters');
    if (value.length > 50) errors.push('Name must be less than 50 characters');
    if (/\s{2,}/.test(value)) errors.push('No multiple spaces allowed');
    if (!/^[a-zA-Z\s]+$/.test(value)) errors.push('Only letters and spaces allowed');
    if (/^\s|\s$/.test(value)) errors.push('No leading or trailing spaces');
    return errors;
  };

  const validateEmail = (value) => {
    const errors = [];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push('Invalid email format');
    }
    if (/\s/.test(value)) errors.push('No spaces allowed in email');
    if (value.length > 100) errors.push('Email too long (max 100 characters)');
    return errors;
  };

  const validatePassword = (value) => {
    const errors = [];
    if (value.length < 8) errors.push('At least 8 characters required');
    if (value.length > 128) errors.push('Maximum 128 characters allowed');
    if (/\s/.test(value)) errors.push('No spaces allowed');
    if (!/[a-z]/.test(value)) errors.push('At least one lowercase letter required');
    if (!/[A-Z]/.test(value)) errors.push('At least one uppercase letter required');
    if (!/[0-9]/.test(value)) errors.push('At least one number required');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) errors.push('At least one special character required');
    return errors;
  };

  // Real-time validation
  const handleNameChange = (value) => {
    setName(value);
    if (!isLogin) {
      const errors = validateName(value);
      setValidationErrors(prev => ({ ...prev, name: errors.length > 0 ? errors : null }));
    }
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    const errors = validateEmail(value);
    setValidationErrors(prev => ({ ...prev, email: errors.length > 0 ? errors : null }));
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (!isLogin) {
      const errors = validatePassword(value);
      setValidationErrors(prev => ({ ...prev, password: errors.length > 0 ? errors : null }));
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');

    // Final validation check
    const nameErrors = !isLogin ? validateName(name) : [];
    const emailErrors = validateEmail(email);
    const passwordErrors = !isLogin ? validatePassword(password) : [];

    if (nameErrors.length > 0 || emailErrors.length > 0 || passwordErrors.length > 0) {
      setValidationErrors({
        name: nameErrors.length > 0 ? nameErrors : null,
        email: emailErrors.length > 0 ? emailErrors : null,
        password: passwordErrors.length > 0 ? passwordErrors : null,
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        // Update profile with name
        await updateProfile(userCredential.user, {
          displayName: name.trim()
        });
      }
      onAuthSuccess();
    } catch (err) {
      let errorMessage = err.message.replace('Firebase: ', '').replace(/\(auth.*\)/, '');
      
      // Custom error messages
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onAuthSuccess();
    } catch (err) {
      let errorMessage = err.message.replace('Firebase: ', '');
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup blocked by browser. Please enable popups and try again.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setValidationErrors({});
  };

  // Password strength indicator
  const getPasswordStrength = (pwd) => {
    if (pwd.length === 0) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (pwd.length >= 8) strength += 20;
    if (pwd.length >= 12) strength += 20;
    if (/[a-z]/.test(pwd)) strength += 15;
    if (/[A-Z]/.test(pwd)) strength += 15;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength += 15;
    
    if (strength < 40) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength < 70) return { strength, label: 'Medium', color: 'bg-yellow-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = !isLogin ? getPasswordStrength(password) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="w-full max-w-md sm:max-w-md md:max-w-md lg:max-w-md xl:max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl transition-transform duration-300 hover:scale-105">
            <span className="text-5xl">☁️</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">AWS SAA-C03 Tracker</h1>
          <p className="text-white/80">Track your AWS certification journey</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] sm:max-h-none overflow-y-auto sm:overflow-visible">
          <div className="flex gap-2 mb-6">
            <button
              onClick={switchMode}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                isLogin
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Login
            </button>
            <button
              onClick={switchMode}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                !isLogin
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-300 flex-shrink-0 mt-0.5" />
              <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                      validationErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none`}
                    placeholder="John Doe"
                    required
                  />
                </div>
                {validationErrors.name && (
                  <div className="mt-1 space-y-1">
                    {validationErrors.name.map((err, i) => (
                      <p key={i} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {err}
                      </p>
                    ))}
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  3-50 characters, letters and single spaces only
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none`}
                  placeholder="your@email.com"
                  required
                />
              </div>
              {validationErrors.email && (
                <div className="mt-1 space-y-1">
                  {validationErrors.email.map((err, i) => (
                    <p key={i} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {err}
                    </p>
                  ))}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Valid email format, no spaces allowed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border ${
                    validationErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none`}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  maxLength={128}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {!isLogin && password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Password Strength:</span>
                    <span className={`text-xs font-semibold ${
                      passwordStrength.strength < 40 ? 'text-red-600' :
                      passwordStrength.strength < 70 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {validationErrors.password && (
                <div className="mt-2 space-y-1">
                  {validationErrors.password.map((err, i) => (
                    <p key={i} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {err}
                    </p>
                  ))}
                </div>
              )}
              
              {!isLogin && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Password must contain:</p>
                  <p className={`text-xs flex items-center gap-1 ${password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {password.length >= 8 ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    At least 8 characters
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {/[A-Z]/.test(password) ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    One uppercase letter
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {/[a-z]/.test(password) ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    One lowercase letter
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {/[0-9]/.test(password) ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    One number
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    One special character (!@#$%^&*)
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${!/\s/.test(password) && password.length > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {!/\s/.test(password) && password.length > 0 ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    No spaces allowed
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!isLogin && (validationErrors.name || validationErrors.email || validationErrors.password))}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Please wait...
                </span>
              ) : (
                isLogin ? 'Login to Your Account' : 'Create Account'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Chrome className="w-5 h-5 text-red-500" />
            Sign in with Google
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={switchMode}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              {isLogin ? 'Sign up now' : 'Login here'}
            </button>
          </p>
        </div>

        <p className="text-center text-white/60 text-sm mt-6 mb-safe">
          © 2025 Gaurav Vengurlekar | All rights reserved
        </p>
      </div>
    </div>
  );
}