import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Code2, Zap, ArrowRight, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { CURRICULUM } from '@/components/learn/curriculum';
import ModuleCard from '@/components/modules/ModuleCard';
import PlaygroundCard from '@/components/learn/PlaygroundCard';
import { useUserProgress } from '@/components/UserProgressContext';

export default function Home() {
  const navigate = useNavigate();
  const { progress } = useUserProgress();

  // Only show first 3 modules as preview
  const previewModules = CURRICULUM.slice(0, 3);

  const handleModuleClick = (module) => {
    const firstLesson = module.lessons[0];
    navigate(`${createPageUrl('Lesson')}?module=${module.slug}&lesson=${firstLesson.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#0AD9DC]/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#011623] to-transparent z-10" />

        <div className="container mx-auto px-4 text-center max-w-4xl relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-2 py-1 bg-[#0AD9DC]/10 text-[#0AD9DC] text-xs font-bold tracking-wide mb-8 uppercase font-mono"
          >
            <span className="text-[#0AD9DC] text-opacity-50">.</span> 
            <span className="px-1 bg-[#0AD9DC] text-[#011623]">BUILD WITH FHENIX</span>
            <span className="text-[#0AD9DC] text-opacity-50">.</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-8 font-display"
          >
            Confidential Computing For <br className="hidden md:block" />
            The Next Wave Of DeFi
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-sans"
          >
            Join developers and protocols building the next generation of onchain applications — powered by encrypted execution.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to={createPageUrl('Learn')}>
              <Button size="lg" className="bg-[#011623] hover:bg-[#022031] text-white border border-white/20 font-bold rounded-none px-8 h-14 text-base w-full sm:w-auto transition-all group">
                Start Learning
                <span className="ml-2 text-[#0AD9DC] group-hover:translate-x-1 transition-transform">❖</span>
              </Button>
            </Link>
            <a href="https://twitter.com/FhenixIO" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="lg" className="text-white hover:text-[#0AD9DC] rounded-none px-8 h-14 text-base w-full sm:w-auto group font-bold">
                Follow Fhenix
                <span className="ml-2 text-[#0AD9DC] opacity-0 group-hover:opacity-100 transition-opacity">➤</span>
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="bg-white py-24 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={ShieldCheck}
              title="Privacy-First Development"
              description="Learn to encrypt data on-chain while still performing computations. Build apps that protect user data by default."
            />
            <FeatureCard 
              icon={Terminal}
              title="Interactive Playgrounds"
              description="Write and test coFHE code directly in your browser with instant feedback. No setup required."
            />
            <FeatureCard 
              icon={Zap}
              title="Self-Paced Learning"
              description="Progress at your own speed with tracked achievements, badges, and milestones as you master FHE."
            />
          </div>
        </div>
      </section>

      {/* Modules Preview */}
      <section className="py-24 bg-[#011623]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Learning Modules</h2>
              <p className="text-slate-400 max-w-xl">
                Progress through comprehensive modules covering everything from FHE basics to advanced coFHE patterns.
              </p>
            </div>
            <Link to={createPageUrl('Learn')}>
              <Button variant="ghost" className="text-[#0AD9DC] hover:text-[#0AD9DC]/80 hover:bg-[#0AD9DC]/10">
                View All Modules <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {previewModules.map((module, index) => {
               // Logic to determine lock status (same as in Learn.js)
               const prevModule = CURRICULUM[index - 1];
               const isLocked = index > 0 && !progress?.completed_modules?.includes(prevModule.id);

               return (
                 <div key={module.id} className="h-[380px]">
                   <ModuleCard 
                    module={module} 
                    progress={{ completedLessons: progress?.completed_lessons || [] }}
                    isLocked={isLocked}
                    onClick={() => handleModuleClick(module)}
                   />
                 </div>
               );
            })}
          </div>
        </div>
      </section>

      {/* Playgrounds Preview */}
      <section className="py-24 bg-[#00101a] border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Interactive Sandboxes</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Get your hands dirty with our browser-based playgrounds. No environment setup required.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
             <PlaygroundCard 
              title="Encryption Playground" 
              description="Experiment with client-side encryption using cofhejs before sending to chain."
            />
            <PlaygroundCard 
              title="FHE Operations" 
              description="Test basic homomorphic operations like add, sub, and bitwise logic."
            />
             <PlaygroundCard 
              title="Permission Generator" 
              description="Generate and sign access permits to view encrypted state."
            />
          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
      <div className="w-12 h-12 bg-[#0AD9DC]/10 rounded-xl flex items-center justify-center mb-6 text-[#0AD9DC]">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}