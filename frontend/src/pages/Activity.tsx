import React, { useState, useEffect } from 'react';
import { Hash, ExternalLink, ArrowRightLeft, ShoppingBag, Sparkles, Loader2 } from 'lucide-react';

interface MarketEvent {
  _id: string;
  type: 'mint' | 'list' | 'sold' | 'cancel';
  user: string;
  details: string;
  timestamp: string;
  txHash: string;
}

const Activity = () => {
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/activity');
        if (res.ok) {
          const data = await res.json();
          setEvents(data.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp).toLocaleString()
          })));
        }
      } catch (e) {
        console.error("Failed to fetch activity", e);
        // Fallback for demo
        setEvents([
          { _id: '1', type: 'sold', user: 'GA7R...', details: 'Example activity from MongoDB', timestamp: 'Just now', txHash: 'a1b2...' }
        ] as any);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'mint': return <Sparkles className="text-purple-400" />;
      case 'list': return <ShoppingBag className="text-blue-400" />;
      case 'sold': return <ArrowRightLeft className="text-green-400" />;
      default: return <Hash />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-4xl font-black">Market Activity</h1>
        <p className="text-slate-400 mt-2">Historical events indexed from Soroban</p>
      </header>

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event._id} className="glass p-6 rounded-3xl flex flex-col sm:flex-row gap-6 items-start sm:items-center card-hover">
            <div className={`p-4 rounded-2xl bg-white/5`}>
              {getIcon(event.type)}
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-400">{event.user.slice(0, 6)}...{event.user.slice(-4)}</span>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold opacity-70">
                  {event.type}
                </span>
              </div>
              <p className="text-lg font-medium">{event.details}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
                <span>{event.timestamp}</span>
                <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer transition-colors">
                  <Hash size={12} /> {event.txHash.slice(0, 8)}... <ExternalLink size={12} />
                </span>
              </div>
            </div>
          </div>
        ))}

        {!loading && events.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center space-y-4 text-slate-500">
            <p>No activity indexed yet. Events will appear here once detected on Soroban.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;
