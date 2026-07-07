import { useState, useEffect } from 'react';
import { Search, UserPlus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

export default function RegisterCourses() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const [supervisorStatus, setSupervisorStatus] = useState<string>('none');
  const [supervisorName, setSupervisorName] = useState<string>('');
  const [supervisorEmail, setSupervisorEmail] = useState<string>('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        setSupervisorStatus(response.data.supervisorStatus || 'none');
        if (response.data.supervisor) {
          if (response.data.supervisor.name) setSupervisorName(response.data.supervisor.name);
          if (response.data.supervisor.email) setSupervisorEmail(response.data.supervisor.email);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const response = await api.get(`/users/search-lecturer?email=${encodeURIComponent(email)}`);
      setSearchResult(response.data);
    } catch (error: any) {
      setSearchError(error.response?.data?.message || 'Lecturer not found');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRequest = async () => {
    if (!searchResult) return;
    try {
      await api.post('/users/request-supervisor', { lecturerId: searchResult._id });
      setSupervisorStatus('pending');
      setSearchResult(null);
    } catch (error: any) {
      setSearchError(error.response?.data?.message || 'Failed to send request');
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col h-full bg-background overflow-hidden p-6 md:p-10">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-4 border-red-500/30 border-t-red-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden p-6 md:p-10">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t('nav.registerCourses') || 'Supervisor Registration'}
          </h1>
          <p className="text-muted-foreground">
            Search for a lecturer by their email address to send a supervision request.
          </p>
        </div>

        {supervisorStatus === 'approved' && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-6 rounded-xl flex items-center gap-4 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="font-bold">You have an approved supervisor</h3>
              <p className="text-sm mt-1">
                You are currently supervised by {supervisorName ? <span className="font-bold">{supervisorName}</span> : 'a lecturer'}.
              </p>
              {supervisorEmail && (
                <p className="text-xs mt-1 opacity-80">{supervisorEmail}</p>
              )}
            </div>
          </div>
        )}

        {supervisorStatus === 'pending' && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-xl flex items-center gap-4 text-amber-700 dark:text-amber-400">
            <Clock className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="font-bold">Request Pending</h3>
              <p className="text-sm mt-1">You have a pending request waiting for a lecturer's approval.</p>
            </div>
          </div>
        )}

        {(supervisorStatus === 'none' || supervisorStatus === 'rejected') && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Find Lecturer</h2>
            
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Enter lecturer's email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {searchError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl mb-4">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{searchError}</p>
              </div>
            )}

            {searchResult && (
              <div className="border border-border rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-red-600 text-lg border border-border">
                    {searchResult.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{searchResult.name}</h3>
                    <p className="text-sm text-muted-foreground">{searchResult.email}</p>
                    {searchResult.institution && (
                      <p className="text-xs text-muted-foreground mt-1">{searchResult.institution}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleRequest}
                  className="flex items-center gap-2 px-6 py-3 bg-foreground text-background hover:bg-muted-foreground font-medium rounded-xl transition-all shadow-sm w-full sm:w-auto justify-center"
                >
                  <UserPlus className="w-5 h-5" />
                  Add
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
