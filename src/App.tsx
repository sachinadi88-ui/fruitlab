/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Info, Apple, Zap, Droplets, Leaf, ChevronRight, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getFruitNutrients, FruitNutrients } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8AC926', '#FF595E'];

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FruitNutrients | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent, fruitOverride?: string) => {
    e?.preventDefault();
    const searchTerm = fruitOverride || query;
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await getFruitNutrients(searchTerm);
      setData(result);
      setQuery(searchTerm);
    } catch (err) {
      setError('Could not find data for that fruit. Try something else!');
    } finally {
      setLoading(false);
    }
  };

  // No default search on mount
  useEffect(() => {
    // Just clear any potential stale states
    setQuery('');
    setData(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-[#1A1A1A] font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="border-b border-black/10 p-6 flex justify-between items-center sticky top-0 bg-[#FDFCF0]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">
            <Apple size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Fruit Lab</h1>
        </div>
        
        <form onSubmit={handleSearch} className="relative max-w-md w-full ml-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fruit (e.g. Dragonfruit)..."
            className="w-full bg-white border-2 border-black rounded-full px-6 py-2 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black text-white rounded-full hover:scale-110 transition-transform"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
          </button>
        </form>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          {!loading && !data ? (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="w-32 h-32 bg-black rounded-full flex items-center justify-center text-white shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)]">
                <Apple size={64} />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black uppercase tracking-tighter">Welcome to Fruit Lab</h2>
                <p className="text-lg font-serif italic opacity-60 max-w-md mx-auto">
                  Enter any fruit name above to analyze its molecular nutritional structure and proportions.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                {['Dragonfruit', 'Avocado', 'Kiwi', 'Pomegranate'].map(f => (
                  <button 
                    key={f}
                    onClick={() => handleSearch(undefined, f)}
                    className="px-4 py-2 border-2 border-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                  >
                    Try {f}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : loading && !data ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[60vh] flex flex-col items-center justify-center gap-4"
            >
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-24 h-24 border-4 border-black border-t-transparent rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Apple size={32} className="animate-pulse" />
                </div>
              </div>
              <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Analyzing nutritional structure...</p>
            </motion.div>
          ) : data ? (
            <motion.div 
              key={data.fruitName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Hero & Description */}
              <div className="lg:col-span-5 space-y-8">
                <div 
                  className="rounded-3xl p-12 relative overflow-hidden border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                  style={{ backgroundColor: data.colorTheme + '20' }}
                >
                  <motion.h2 
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    className="text-7xl font-black uppercase leading-none tracking-tighter text-black"
                  >
                    {data.fruitName}
                  </motion.h2>
                  <div className="flex gap-4 mt-6">
                    <span className="px-4 py-1 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest">
                      {data.servingSize} Serving
                    </span>
                    <span className="px-4 py-1 border-2 border-black rounded-full text-xs font-bold uppercase tracking-widest">
                      {data.calories} Kcal
                    </span>
                  </div>
                </div>

                <div className="bg-white border-2 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Info size={14} /> Profile
                  </h3>
                  <p className="text-lg leading-relaxed italic font-serif">
                    "{data.description}"
                  </p>
                </div>
              </div>

              {/* Right Column: Charts & Data */}
              <div className="lg:col-span-7 space-y-8">
                {/* Macro Breakdown */}
                <div className="bg-white border-2 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="font-mono text-xs uppercase tracking-widest mb-8 flex justify-between items-center">
                    <span>Macronutrient Proportion</span>
                    <span className="opacity-50">Gram-wise analysis</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.macros}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="percentage"
                            nameKey="name"
                          >
                            {data.macros.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="black" strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: '2px solid black', boxShadow: '4px 4px 0px black' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                      {data.macros.map((macro, idx) => (
                        <div key={macro.name} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span className="font-bold uppercase text-sm tracking-tight">{macro.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{macro.amount}{macro.unit}</span>
                            <div className="w-12 h-1 bg-black/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${macro.percentage}%` }}
                                className="h-full bg-black"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Micronutrients */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#E6F4F1] border-2 border-black p-6 rounded-3xl">
                    <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Zap size={12} /> Key Vitamins
                    </h4>
                    <div className="space-y-3">
                      {data.micros.slice(0, 4).map((micro) => (
                        <div key={micro.name} className="flex justify-between items-end border-b border-black/10 pb-1">
                          <span className="text-sm font-bold">{micro.name}</span>
                          <span className="text-xs font-mono opacity-60">{micro.amount}{micro.unit} ({micro.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#FFF0E6] border-2 border-black p-6 rounded-3xl">
                    <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Droplets size={12} /> Minerals & Others
                    </h4>
                    <div className="space-y-3">
                      {data.micros.slice(4, 8).map((micro) => (
                        <div key={micro.name} className="flex justify-between items-end border-b border-black/10 pb-1">
                          <span className="text-sm font-bold">{micro.name}</span>
                          <span className="text-xs font-mono opacity-60">{micro.amount}{micro.unit} ({micro.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Stats Bento */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Water Content', value: 'High', icon: Droplets, color: 'bg-blue-100' },
                    { label: 'Fiber Source', value: 'Excellent', icon: Leaf, color: 'bg-green-100' },
                    { label: 'Energy Density', value: 'Low', icon: Zap, color: 'bg-yellow-100' },
                    { label: 'Glycemic Index', value: 'Medium', icon: Info, color: 'bg-purple-100' },
                  ].map((stat) => (
                    <div key={stat.label} className={cn("p-4 border-2 border-black rounded-2xl flex flex-col items-center text-center gap-2", stat.color)}>
                      <stat.icon size={20} />
                      <div>
                        <p className="text-[10px] uppercase font-bold opacity-50">{stat.label}</p>
                        <p className="text-sm font-black uppercase">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {error && (
          <div className="mt-8 p-4 bg-red-100 border-2 border-red-500 text-red-700 rounded-xl text-center font-bold">
            {error}
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-black/10 p-12 text-center">
        <p className="font-mono text-xs uppercase tracking-widest opacity-40">
          Powered by Gemini AI • Nutritional data is approximate
        </p>
      </footer>
    </div>
  );
}
