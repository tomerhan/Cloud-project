import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FileText, Mail, Lock, User, Building, ArrowRight, Sun, Moon, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'sonner';
import api from '../../services/api';

export default function Register() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    institution: '',
    role: 'student', // default role
    password: '',
    confirmPassword: ''
  });

  // Load theme from localStorage on mount, default to light
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
    } else {
      setTheme('light');
      localStorage.setItem('theme', 'light');
    }
  }, [setTheme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.register.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t('auth.register.passwordTooShort'));
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/users/register', {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        institution: formData.institution
      });
      
      toast.success(t('auth.register.success'));
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('auth.register.failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-6 relative animate-in fade-in duration-300 overflow-y-auto">
      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="absolute top-6 right-6 p-3 rounded-lg bg-card border border-border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-md"
        title={t('auth.toggleTheme')}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
      </button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">ResearchAI</h1>
            <p className="text-muted-foreground">{t('auth.register.tagline')}</p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">{t('auth.register.title')}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('auth.register.fullNameLabel')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder={t('auth.register.fullNamePlaceholder')}
                  className="w-full pl-11 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('auth.register.usernameLabel')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder={t('auth.register.usernamePlaceholder')}
                  className="w-full pl-11 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('auth.register.emailLabel')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder={t('auth.register.emailPlaceholder')}
                  className="w-full pl-11 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('auth.register.accountTypeLabel')}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`border rounded-lg p-3 cursor-pointer transition-colors ${formData.role === 'student' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-input hover:bg-muted'}`}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={formData.role === 'student'}
                      onChange={(e) => handleChange('role', e.target.value)}
                      className="text-red-600 focus:ring-red-500"
                      disabled={isLoading}
                    />
                    <span className="ml-2 font-medium text-sm text-foreground">{t('auth.register.student')}</span>
                  </div>
                </label>
                <label className={`border rounded-lg p-3 cursor-pointer transition-colors ${formData.role === 'lecturer' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-input hover:bg-muted'}`}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="lecturer"
                      checked={formData.role === 'lecturer'}
                      onChange={(e) => handleChange('role', e.target.value)}
                      className="text-red-600 focus:ring-red-500"
                      disabled={isLoading}
                    />
                    <span className="ml-2 font-medium text-sm text-foreground">{t('auth.register.lecturer')}</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('auth.register.institutionLabel')}
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => handleChange('institution', e.target.value)}
                  placeholder={t('auth.register.institutionPlaceholder')}
                  className="w-full pl-11 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('auth.register.passwordLabel')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('auth.register.confirmPasswordLabel')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-start">
              <input type="checkbox" className="mt-1 rounded text-red-600 focus:ring-red-500" required disabled={isLoading} />
              <span className="ml-2 text-sm text-muted-foreground">
                {t('auth.register.agreeToTerms')}{' '}
                <button type="button" className="text-red-600 hover:text-red-700 font-medium">
                  {t('auth.register.termsOfService')}
                </button>{' '}
                {t('auth.register.and')}{' '}
                <button type="button" className="text-red-600 hover:text-red-700 font-medium">
                  {t('auth.register.privacyPolicy')}
                </button>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.register.submit')}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth.register.alreadyHaveAccount')}{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                {t('auth.register.signIn')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
