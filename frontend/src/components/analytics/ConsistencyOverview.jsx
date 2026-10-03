import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api';

export default function ConsistencyOverview({ updateTrigger }) {
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.getAnalytics(period);
      setData(response);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period, updateTrigger]);

  return (
    <section className="bg-navy-800 rounded-3xl p-6 border border-navy-700 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-cream-200">Consistency Overview</h3>
          <p className="text-sm text-blue-400">Track how consistently you complete your habits.</p>
        </div>
        <div className="flex bg-navy-900 rounded-lg p-1 border border-navy-700 w-full sm:w-auto">
          {['week', 'month', 'year'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 sm:px-4 py-1 rounded-md text-sm font-medium transition-colors ${period === p ? 'bg-navy-700 text-lime-400' : 'text-cream-200/60 hover:text-cream-200'}`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="text-center py-10 bg-navy-900/50 rounded-2xl border border-navy-700 border-dashed">
          <p className="text-red-400 mb-2">Unable to load analytics</p>
          <p className="text-cream-200/60 text-sm mb-4">Please try again.</p>
          <button 
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-navy-700 hover:bg-navy-600 rounded-lg text-cream-200 text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      ) : loading && !data ? (
        <div className="text-center py-16 bg-navy-900/50 rounded-2xl border border-navy-700 border-dashed flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-navy-700 border-t-lime-400 rounded-full animate-spin mb-4"></div>
          <p className="text-blue-400">Loading analytics...</p>
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="text-center py-12 bg-navy-900/50 rounded-2xl border border-navy-700 border-dashed">
          <p className="text-cream-200 mb-2 font-medium">No consistency data yet</p>
          <p className="text-blue-400 text-sm">Complete your habits to start seeing your progress here.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8 text-center sm:text-left">
            <div>
              <p className="text-2xl font-bold text-lime-400">{data.average_completion}%</p>
              <p className="text-sm text-cream-200/60">Average</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${data.change_from_previous >= 0 ? 'text-blue-500' : 'text-red-400'}`}>
                {data.change_from_previous > 0 ? '+' : ''}{data.change_from_previous}%
              </p>
              <p className="text-sm text-cream-200/60">{data.change_from_previous === 0 && data.average_completion === 0 ? 'No previous data' : 'vs previous'}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400 truncate" title={data.best_period.label}>{data.best_period.label}</p>
              <p className="text-sm text-cream-200/60">
                Best {period === 'week' ? 'Day' : period === 'month' ? 'Week' : 'Month'}
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.data}>
                <defs>
                  <linearGradient id="colorConsistency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E4FF30" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#E4FF30" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="label" 
                  stroke="#362F4F" 
                  tick={{fill: '#6EACDA', fontSize: 12}} 
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  hide 
                  domain={[0, 100]} 
                />
                <Tooltip 
                  cursor={{stroke: '#362F4F', strokeWidth: 1, strokeDasharray: '5 5'}}
                  contentStyle={{ backgroundColor: '#03346E', borderColor: '#362F4F', borderRadius: '8px', color: '#E2E2B6' }}
                  itemStyle={{ color: '#E4FF30' }}
                  formatter={(value) => [`${value}%`, 'Completion Rate']}
                  labelStyle={{ color: '#6EACDA', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="completion_rate" 
                  stroke="#E4FF30" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorConsistency)" 
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  );
}
