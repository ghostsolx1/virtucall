'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check if user is logged in on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        router.push('/login');
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        router.push('/login');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) setUser(data);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${searchQuery}%`)
      .neq('id', user?.id); // Don't show yourself
    
    setResults(data || []);
    setLoading(false);
  };

  const startCall = (targetUserId: string) => {
    // Redirect to the call interface, passing the target user's ID
    window.location.href = `/call/${targetUserId}`;
  };

  if (!user) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading VirtuCall...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-10 border-b border-gray-800 pb-4">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">VirtuCall</h1>
        <button 
          onClick={() => supabase.auth.signOut()} 
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </header>

      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* User Profile Card */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex items-center gap-4">
          <img 
            src={user.avatar_url || 'https://via.placeholder.com/100'} 
            alt="My Avatar" 
            className="w-16 h-16 rounded-full object-cover border-2 border-purple-500" 
          />
          <div>
            <p className="text-xl font-bold">{user.name}</p>
            <p className="text-gray-400">@{user.username}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Find Friends</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search username..." 
              className="flex-1 p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 outline-none transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? '...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-300">Results</h3>
            {results.map((profile) => (
              <div key={profile.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between hover:bg-gray-750 transition">
                <div className="flex items-center gap-3">
                  <img src={profile.avatar_url || 'https://via.placeholder.com/50'} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold">{profile.name}</p>
                    <p className="text-sm text-gray-400">@{profile.username}</p>
                  </div>
                </div>
                <button 
                  onClick={() => startCall(profile.id)} 
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  <span>📹</span> Call
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}