'use client';
import { useEffect, useState, useRef } from 'react';
import { useRoom, useTracks, Participant, Track } from '@livekit/components-react';
import { Room, AudioTrack, VideoTrack } from 'livekit-client';
import { useRouter } from 'next/navigation';

interface CallProps {
  params: { userId: string };
}

export default function CallPage({ params }: CallProps) {
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  
  // Ref to handle file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Avatar Upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger the hidden file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="h-screen w-screen bg-gray-900 relative flex items-center justify-center overflow-hidden">
      
      {/* Hidden File Input for Avatar */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleAvatarUpload} 
        className="hidden" 
      />

      {/* Header Controls */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <button onClick={triggerFileInput} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded shadow-lg text-sm font-bold">
          Change Avatar Image
        </button>
        <button 
          onClick={() => router.push('/')} 
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded shadow-lg text-sm font-bold"
        >
          End Call
        </button>
      </div>

      {/* Avatar Selection/Preview Area (If not connected yet) */}
      {!avatarImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40">
          <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Select Your Character</h2>
            <p className="mb-6 text-gray-400">Upload an image to represent you in this call.</p>
            <button onClick={triggerFileInput} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">
              Choose Image
            </button>
          </div>
        </div>
      )}

      {/* Main Video Grid */}
      <div className="relative w-full h-full p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Local User (You) */}
        <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-700">
          <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-xs font-bold z-10">You</div>
          
          {/* The Avatar Layer - This sits ON TOP of your video */}
          {avatarImage && (
            <div className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay opacity-80">
              <img src={avatarImage} alt="My Avatar" className="w-full h-full object-cover animate-pulse-slow" />
            </div>
          )}

          {/* Actual Video Feed */}
          <ParticipantView />
        </div>

        {/* Remote User (Them) */}
        <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-700">
          <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-xs font-bold z-10">Remote User</div>
          <ParticipantView />
        </div>
      </div>
    </div>
  );
}

// Helper component to render tracks cleanly
function ParticipantView() {
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone]);
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-800">
      {tracks.length === 0 ? (
        <div className="text-gray-500">Waiting for camera...</div>
      ) : (
        tracks.map(track => (
          <Participant key={track.trackSid} track={track} />
        ))
      )}
    </div>
  );
}