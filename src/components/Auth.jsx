import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, Lock, User, Chrome, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Enhanced email validation
  const validateEmail = (value) => {
    const errors = [];
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(value)) {
      errors.push('Invalid email format');
    }
    if (/\s/.test(value)) {
      errors.push('No spaces allowed in email');
    }
    if (value.length > 100) {
      errors.push('Email too long (max 100 characters)');
    }
    
    // Check for common typos in popular domains
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const domain = value.split('@')[1];
    if (domain) {
      const isTypo = commonDomains.some(correctDomain => {
        const similarity = levenshteinDistance(domain.toLowerCase(), correctDomain);
        return similarity === 1 || similarity === 2; // Close match
      });
      if (isTypo) {
        errors.push(`Did you mean @${commonDomains.find(d => levenshteinDistance(domain.toLowerCase(), d) <= 2)}?`);
      }
    }
    
    return errors;
  };

  // Levenshtein distance for typo detection
  const levenshteinDistance = (str1, str2) => {
    const track = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) track[0][i] = i;
    for (let j = 0; j <= str2.length; j += 1) track[j][0] = j;
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator,
        );
      }
    }
    return track[str2.length][str1.length];
  };

  const validateName = (value) => {
    const errors = [];
    if (value.length < 3) errors.push('Name must be at least 3 characters');
    if (value.length > 50) errors.push('Name must be less than 50 characters');
    if (/\s{2,}/.test(value)) errors.push('No multiple spaces allowed');
    if (!/^[a-zA-Z\s]+$/.test(value)) errors.push('Only letters and spaces allowed');
    if (/^\s|\s$/.test(value)) errors.push('No leading or trailing spaces');
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

  const getFriendlyErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/email-already-in-use': '❌ Email already exists. Please login instead.',
      'auth/wrong-password': '❌ Invalid email or password. Please try again.',
      'auth/user-not-found': '❌ No account found with this email. Please sign up.',
      'auth/too-many-requests': '⏳ Too many attempts. Please try again later.',
      'auth/network-request-failed': '🌐 Network error. Check your internet connection.',
      'auth/invalid-email': '❌ Invalid email format.',
      'auth/weak-password': '❌ Password is too weak. Use a stronger password.',
      'auth/operation-not-allowed': '❌ Operation not allowed. Contact support.',
      'auth/invalid-credential': '❌ Invalid credentials. Please check your email and password.',
      'auth/user-disabled': '❌ Account has been disabled. Contact support.',
    };
    return errorMessages[errorCode] || `❌ ${errorCode.replace('auth/', '').replace(/-/g, ' ')}`;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Final validation
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
        setSuccess('✅ Login successful! Redirecting...');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(userCredential.user, {
          displayName: name.trim()
        });
        setSuccess('✅ Account created successfully! Redirecting...');
      }
      setTimeout(() => onAuthSuccess(), 1000);
    } catch (err) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const emailErrors = validateEmail(email);
    if (emailErrors.length > 0) {
      setValidationErrors({ email: emailErrors });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess('✅ Password reset email sent! Check your inbox.');
      setTimeout(() => {
        setIsForgotPassword(false);
        setIsLogin(true);
      }, 3000);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('❌ No account found with this email.');
      } else {
        setError(getFriendlyErrorMessage(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setSuccess('✅ Signed in with Google! Redirecting...');
      setTimeout(() => onAuthSuccess(), 1000);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('❌ Sign-in popup was closed. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('❌ Popup blocked. Please enable popups and try again.');
      } else {
        setError(getFriendlyErrorMessage(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setError('');
    setSuccess('');
    setValidationErrors({});
  };

  const passwordStrength = !isLogin ? (() => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;
    if (strength < 40) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength < 70) return { strength, label: 'Medium', color: 'bg-yellow-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  })() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 flex flex-col items-center justify-start p-4 overflow-y-auto">
      <div className="w-full max-w-md my-auto py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <span className="text-5xl">☁️</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">AWS SAA-C03 Tracker</h1>
          <p className="text-white/80">Track your AWS certification journey</p>
        </div>
  
        {/* Auth Card - Centered and Full Width */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full">
          {/* Forgot Password Screen */}
          {isForgotPassword ? (
            <>
              <button
                onClick={() => setIsForgotPassword(false)}
                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline mb-4 text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Enter your email and we'll send you a password reset link
              </p>
  
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-300 flex-shrink-0 mt-0.5" />
                  <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                </div>
              )}
  
              {success && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-300 flex-shrink-0 mt-0.5" />
                  <span className="text-green-700 dark:text-green-300 text-sm">{success}</span>
                </div>
              )}
  
              <form onSubmit={handleForgotPassword} className="space-y-4">
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
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {validationErrors.email[0]}
                    </p>
                  )}
                </div>
  
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Login/Signup Tabs */}
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
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-300 flex-shrink-0 mt-0.5" />
                  <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                </div>
              )}
  
              {success && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-300 flex-shrink-0 mt-0.5" />
                  <span className="text-green-700 dark:text-green-300 text-sm">{success}</span>
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
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> {validationErrors.name[0]}
                      </p>
                    )}
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
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {validationErrors.email[0]}
                    </p>
                  )}
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
                  
                  {!isLogin && password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Strength:</span>
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
                      <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                        <p className={password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                          {password.length >= 8 ? '✓' : '○'} 8+ chars
                        </p>
                        <p className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                          {/[A-Z]/.test(password) ? '✓' : '○'} Uppercase
                        </p>
                        <p className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                          {/[a-z]/.test(password) ? '✓' : '○'} Lowercase
                        </p>
                        <p className={/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                          {/[0-9]/.test(password) ? '✓' : '○'} Number
                        </p>
                        <p className={/[!@#$%^&*]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                          {/[!@#$%^&*]/.test(password) ? '✓' : '○'} Special
                        </p>
                        <p className={!/\s/.test(password) && password.length > 0 ? 'text-green-600' : 'text-gray-500'}>
                          {!/\s/.test(password) && password.length > 0 ? '✓' : '○'} No spaces
                        </p>
                      </div>
                    </div>
                  )}
  
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-2 block"
                    >
                      Forgot password?
                    </button>
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
            </>
          )}
        </div>
  
        <p className="text-center text-white/60 text-sm mt-6">
          © 2025 Gaurav Vengurlekar | All rights reserved
        </p>
      </div>
    </div>
  );
}