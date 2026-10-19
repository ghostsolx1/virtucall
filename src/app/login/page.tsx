'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // SIGN UP LOGIC
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            username: username,
          },
        },
      });

      if (error) {
        alert(error.message);
      } else {
        alert('Account created successfully! You can now log in.');
        router.push('/'); // Redirect to home after success
      }
    } else {
      // LOGIN LOGIC
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert('Invalid login details');
      } else {
        router.push('/'); // Redirect to home if successful
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold text-center text-purple-500">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>

        {isSignUp && (
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Display Name" 
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-purple-500 outline-none transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
            <input 
              type="text" 
              placeholder="Username (Unique)" 
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-purple-500 outline-none transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
        )}

        <input 
          type="email" 
          placeholder="Email Address" 
          className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-purple-500 outline-none transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-purple-500 outline-none transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold p-3 rounded transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Log In')}
        </button>

        <p 
          className="text-center text-gray-400 cursor-pointer hover:text-purple-400 transition"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
        </p>
      </form>
    </div>
  );
}