'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// --- SVGs / Icons ---
const CheckIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CheckCircleIcon = () => (
  <motion.svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="38" stroke="#22C55E" strokeWidth="4"/>
    <motion.path 
      d="M24 40L36 52L56 28" 
      stroke="#22C55E" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
    />
  </motion.svg>
)

// --- Constants ---
const PREDEFINED_SKILLS = [
  'React', 'Node.js', 'Python', 'Figma', 'Flutter', 'ML/AI', 'UI Design', 'SQL', 
  'Marketing', 'DevOps', 'iOS', 'Android', 'Data', 'Business Dev', 'Content', 'Finance'
];

const FOUNDER_STAGES = [
  { id: 'Idea', label: 'Idea' },
  { id: 'MVP', label: 'MVP' },
  { id: 'Early Traction', label: 'Early Traction' },
  { id: 'Growth', label: 'Growth' }
];

const STUDENT_YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Graduated'];

const AVAILABILITY_OPTS = [
  { id: 'Ready to join', color: '#22C55E' },
  { id: 'Just browsing', color: '#EAB308' },
  { id: 'Busy for now', color: '#9CA3AF' }
];

const stepVariants = {
  initial: { x: 40, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
  exit: { x: -40, opacity: 0, transition: { duration: 0.25 } }
};

export default function OnboardingPage() {
  const router = useRouter()
  
  // -- Local State --
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'founder' | 'student' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Founder Data
  const [fName, setFName] = useState('');
  const [startupName, setStartupName] = useState('');
  const [tagline, setTagline] = useState('');
  const [stage, setStage] = useState('');
  const [city, setCity] = useState('');

  // Student Data
  const [sName, setSName] = useState('');
  const [uni, setUni] = useState('');
  const [year, setYear] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [availability, setAvailability] = useState('');

  // --- Helpers ---
  const handleNext = async () => {
    if (step === 2) {
      setIsSubmitting(true);
      // Mock save to Supabase + Clerk metadata
      await new Promise(res => setTimeout(res, 1200));
      setIsSubmitting(false);
      setStep(3);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const toggleSkill = (skill: string) => {
    setSkills(prev => {
      if (prev.includes(skill)) return prev.filter(s => s !== skill);
      if (prev.length >= 6) return prev;
      return [...prev, skill];
    });
  };

  const addCustomSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customSkill.trim()) {
      e.preventDefault();
      if (!skills.includes(customSkill.trim()) && skills.length < 6) {
        setSkills([...skills, customSkill.trim()]);
      }
      setCustomSkill('');
    }
  };

  // --- Computed UI mapping ---
  let leftQuote = "";
  let leftIllustrator: React.ReactNode = null;

  if (step === 1) {
    leftQuote = "Every great company started with a founder who finally found the right person.";
    leftIllustrator = (
      <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#5B21B6] shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
        <span className="text-[48px]">🚀</span>
      </div>
    );
  } else if (step === 2) {
    if (role === 'founder') {
      leftQuote = "The best co-founders aren't found on job boards. They're found in places built for builders.";
      leftIllustrator = (
        <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#5B21B6] shadow-xl">
          <span className="text-[48px]">🏗️</span>
        </div>
      );
    } else {
      leftQuote = "The best portfolio projects aren't assigned. They're chosen.";
      leftIllustrator = (
        <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#5B21B6] shadow-xl">
          <span className="text-[48px]">🎯</span>
        </div>
      );
    }
  } else if (step === 3) {
    leftQuote = role === 'founder' 
      ? "Your team is waiting. Let's go find them." 
      : "Your first project is one application away.";
    
    // Confetti
    leftIllustrator = (
      <div className="relative flex h-[120px] w-[120px] items-center justify-center">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full h-[12px] w-[12px]"
            style={{ backgroundColor: ['#F97316', '#0D9488', '#22C55E', '#EAB308'][i%4] }}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{ 
              scale: [0, 1, 0],
              x: Math.cos(i * 45 * Math.PI / 180) * 80,
              y: Math.sin(i * 45 * Math.PI / 180) * 80,
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        ))}
        <span className="text-[48px] z-10">🎉</span>
      </div>
    );
  }

  const isStep2Valid = role === 'founder' 
    ? (fName.trim() && startupName.trim() && tagline.trim() && stage && city.trim())
    : (sName.trim() && uni.trim() && year && skills.length > 0 && availability);

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#FAFAF7] font-sans">
      
      {/* ━━━ LEFT PANEL ━━━ */}
      <div className="relative flex w-full lg:w-[45%] flex-col justify-between bg-[#6B4FD8] p-8 lg:p-12 lg:sticky lg:top-0 lg:h-screen">
        <Link href="/" className="font-sans text-[20px] font-extrabold text-white no-underline w-fit">
          IBF<span className="text-white">.</span>
        </Link>

        <div className="flex flex-col gap-12 my-12 lg:my-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="min-h-[160px]"
            >
              <h1 className="m-0 font-serif italic text-[36px] lg:text-[48px] leading-[1.1] text-white">
                "{leftQuote}"
              </h1>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={step + (role || '')}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex justify-center lg:justify-start"
            >
              {leftIllustrator}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center lg:justify-start gap-[8px]">
          {[1, 2, 3].map((idx) => (
            <div 
              key={idx} 
              className={`h-[4px] rounded-full transition-all duration-300 ${
                idx === step ? 'w-[24px] bg-white' : idx < step ? 'w-[12px] bg-white/60' : 'w-[12px] bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ━━━ RIGHT PANEL ━━━ */}
      <div className="flex w-full lg:w-[55%] flex-col justify-center p-8 lg:p-16 overflow-y-auto min-h-screen">
        <div className="mx-auto w-full max-w-[560px]">
          <AnimatePresence mode="wait">

            {/* STEP 1: ROLE */}
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full">
                <h2 className="m-0 mb-[8px] font-sans text-[32px] font-extrabold text-[#1A1208]">What brings you to IBF?</h2>
                <p className="m-0 mb-[40px] font-sans text-[15px] font-light leading-[1.6] text-[#9A8E7E]">
                  This shapes your entire experience. You can always explore both sides later.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] mb-[40px]">
                  {/* Founder Card */}
                  <motion.div 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole('founder')}
                    className={`cursor-pointer rounded-[20px] border-[2px] p-[24px] transition-all
                      ${role === 'founder' 
                          ? 'border-[#6B4FD8] bg-[#EDE8FF] shadow-[0_0_0_4px_rgba(107,79,216,0.12)]' 
                          : 'border-[#E8E5DE] bg-white hover:border-[#6B4FD8] hover:bg-[#FAFAF7]'
                        }
                    `}
                  >
                    <div className="mb-[20px] flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[#EDE8FF]">
                      <span className="text-[28px]">🚀</span>
                    </div>
                    <h3 className="m-0 mb-[8px] font-sans text-[18px] font-extrabold text-[#1A1208]">I'm a founder</h3>
                    <p className="m-0 mb-[24px] font-sans text-[14px] font-light leading-[1.5] text-[#9A8E7E] min-h-[64px]">
                      I have an idea or project and need talented people to build it with me
                    </p>
                    <div className="font-sans text-[11px] font-medium text-[#1A1208]">
                      <span className="text-[#22C55E]">·</span> Post projects <span className="text-[#22C55E]">·</span> Find talent <span className="text-[#22C55E]">·</span> Build teams
                    </div>
                  </motion.div>

                  {/* Student Card */}
                  <motion.div 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole('student')}
                    className={`cursor-pointer rounded-[20px] border-[2px] p-[24px] transition-all
                      ${role === 'student' 
                          ? 'border-[#0D9488] bg-[#E0F7F5] shadow-[0_0_0_4px_rgba(13,148,136,0.12)]' 
                          : 'border-[#E8E5DE] bg-white hover:border-[#0D9488] hover:bg-[#FAFAF7]'
                        }
                    `}
                  >
                    <div className="mb-[20px] flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[#E0F7F5]">
                      <span className="text-[28px]">🎓</span>
                    </div>
                    <h3 className="m-0 mb-[8px] font-sans text-[18px] font-extrabold text-[#1A1208]">I'm a student</h3>
                    <p className="m-0 mb-[24px] font-sans text-[14px] font-light leading-[1.5] text-[#9A8E7E] min-h-[64px]">
                      I want to work on real startup projects, grow my skills, and build a portfolio that matters
                    </p>
                    <div className="font-sans text-[11px] font-medium text-[#1A1208]">
                      <span className="text-[#0D9488]">·</span> Find projects <span className="text-[#0D9488]">·</span> Build portfolio <span className="text-[#0D9488]">·</span> Get endorsed
                    </div>
                  </motion.div>
                </div>

                <div className="w-full">
                  <button 
                    onClick={handleNext}
                    disabled={!role}
                    className="flex w-full items-center justify-center rounded-[12px] bg-[#6B4FD8] py-[16px] font-sans text-[16px] font-bold text-white transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-[#5B3FC8] active:scale-[0.98]"
                  >
                    Continue &rarr;
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2A: FOUNDER */}
            {step === 2 && role === 'founder' && (
              <motion.div key="step2f" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full">
                <h2 className="m-0 mb-[8px] font-sans text-[32px] font-extrabold text-[#1A1208]">Tell us about what you're building.</h2>
                <p className="m-0 mb-[40px] font-sans text-[15px] font-light leading-[1.6] text-[#9A8E7E]">
                  Don't overthink it. Even a rough idea is enough to start finding your team.
                </p>

                <div className="flex flex-col gap-[32px]">
                  {/* Field 1 */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex flex-col">
                    <label className="font-sans text-[13px] font-semibold text-[#1A1208] mb-[8px]">What's your first name?</label>
                    <input 
                      type="text" value={fName} onChange={e => setFName(e.target.value)}
                      placeholder="Rahul"
                      className="border-b-[2px] border-[#E8E5DE] bg-transparent py-[8px] font-sans text-[20px] text-[#1A1208] placeholder:text-[#BDB5A8] focus:border-[#6B4FD8] focus:outline-none transition-colors"
                    />
                  </motion.div>

                  {/* Field 2 */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col">
                    <label className="font-sans text-[13px] font-semibold text-[#1A1208] mb-[8px]">Give your startup a name — or a working title.</label>
                    <input 
                      type="text" value={startupName} onChange={e => setStartupName(e.target.value)}
                      placeholder="Something AI, something bold, or just 'Project X' for now"
                      className="border-b-[2px] border-[#E8E5DE] bg-transparent py-[8px] font-sans text-[20px] text-[#1A1208] placeholder:text-[#BDB5A8] focus:border-[#6B4FD8] focus:outline-none transition-colors"
                    />
                  </motion.div>

                  {/* Field 3 */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col">
                    <label className="font-sans text-[13px] font-semibold text-[#1A1208] mb-[8px]">In one sentence, what does it do?</label>
                    <textarea 
                      value={tagline} onChange={e => setTagline(e.target.value)} rows={2}
                      placeholder="We help [who] to [do what] so they can [outcome]"
                      className="border-b-[2px] border-[#E8E5DE] bg-transparent py-[8px] font-sans text-[20px] text-[#1A1208] placeholder:text-[#BDB5A8] focus:border-[#6B4FD8] focus:outline-none transition-colors resize-none"
                    />
                  </motion.div>

                  {/* Field 4 */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col">
                    <label className="font-sans text-[13px] font-semibold text-[#1A1208] mb-[12px]">What stage are you at?</label>
                    <div className="grid grid-cols-2 gap-[12px]">
                      {FOUNDER_STAGES.map(s => (
                        <div 
                          key={s.id} onClick={() => setStage(s.id)}
                          className={`cursor-pointer rounded-[12px] border-[2px] py-[16px] text-center font-sans text-[15px] font-bold transition-all
                            ${stage === s.id ? 'border-[#6B4FD8] bg-[#EDE8FF] text-[#6B4FD8]' : 'border-[#E8E5DE] bg-white text-[#9A8E7E] hover:border-[#BDB5A8]'}
                          `}
                        >
                          {s.label}
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Field 5 */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex flex-col">
                    <label className="font-sans text-[13px] font-semibold text-[#1A1208] mb-[8px]">Which city are you building from?</label>
                    <input 
                      type="text" value={city} onChange={e => setCity(e.target.value)}
                      placeholder="Bangalore, Mumbai, remote..."
                      className="border-b-[2px] border-[#E8E5DE] bg-transparent py-[8px] font-sans text-[20px] text-[#1A1208] placeholder:text-[#BDB5A8] focus:border-[#6B4FD8] focus:outline-none transition-colors"
                    />
                  </motion.div>
                </div>

                <div className="w-full mt-[48px]">
                  <button 
                    onClick={handleNext}
                    disabled={!isStep2Valid || isSubmitting}
                    className="flex w-full items-center justify-center rounded-[12px] bg-[#6B4FD8] py-[16px] font-sans text-[16px] font-bold text-white transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-[#5B3FC8] active:scale-[0.98]"
                  >
                    {isSubmitting ? 'Saving...' : 'Finish setup \u2192'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2B: STUDENT */}
            {step === 2 && role === 'student' && (
              <motion.div key="step2s" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full">
                <h2 className="m-0 mb-[8px] font-sans text-[32px] font-extrabold text-[#1A1208]">Tell us about yourself.</h2>
                <p className="m-0 mb-[40px] font-sans text-[15px] font-light leading-[1.6] text-[#9A8E7E]">
                  Founders use this to find the right people. Make it count — but don't overthink it either.
                </p>

                <div className="flex flex-col gap-[32px]">
                  {/* Field 1 */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex flex-col">
                    <label className="font-sans text-[13px] font-semibold text-[#1A1208] mb-[8px]">What's your first name?</label>
                    <input 
                      type="text" value={sName} onChange={e => setSName(e.target.value)}
                      placeholder="Priya"
                      className="border-b-[2px] border-[#E8E5DE] bg-transparent py-[8px] font-sans text-[20px] text-[#1A1208] placeholder:text-[#BDB5A8] focus:border-[#0D9488] focus:outline-none transition-colors"
                    />
                  </motion.div>

                  {/* Field 2 */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col">
                    <label className="font-sans text-[13px] font-semibold text-[#1A1208] mb-[8px]">Where do you study?</label>
                    <input 
                      type="text" value={uni} onChange={e => setUni(e.target.value)}
                      placeholder="BITS Pilani, IIT Bombay, Christ University..."
                      className="border-b-[2px] border-[#E8E5DE] bg-transparent py-[8px] font-sans text-[20px] text-[#1A1208] placeholder:text-[#BDB5A8] focus:border-[#0D9488] focus:outline-none transition-colors"
                    />
                  </motion.div>

                  {/* Field 3 */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col">
                    <label className="font-sans text-[13px] font-semibold text-[#1A1208] mb-[12px]">What year are you in?</label>
                    <div className="flex flex-wrap gap-[8px]">
                      {STUDENT_YEARS.map(y => (
                        <div 
                          key={y} onClick={() => setYear(y)}
                          className={`cursor-pointer rounded-full border px-[16px] py-[8px] font-sans text-[14px] font-semibold transition-all
                            ${year === y ? 'border-[#0D9488] bg-[#0D9488] text-white' : 'border-[#E8E5DE] bg-white text-[#9A8E7E] hover:border-[#BDB5A8]'}
                          `}
                        >
                          {y}
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Field 4 */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col">
                    <label className="font-sans text-[13px] font-semibold text-[#1A1208] mb-[12px]">
                      What can you build? Pick your top skills. <span className="font-light text-[#9A8E7E]">(Max 6)</span>
                    </label>
                    <div className="flex flex-wrap gap-[8px] mb-[12px]">
                      {PREDEFINED_SKILLS.map(skill => {
                        const isSelected = skills.includes(skill);
                        return (
                          <div 
                            key={skill} onClick={() => toggleSkill(skill)}
                            className={`cursor-pointer rounded-[8px] border px-[12px] py-[6px] font-sans text-[13px] font-semibold transition-all
                              ${isSelected ? 'border-[#6B4FD8] bg-[#6B4FD8] text-white shadow-sm' : 'border-[#E8E5DE] bg-white text-[#5A4E3E] hover:border-[#6B4FD8]'}
                            `}
                          >
                            {skill}
                          </div>
                        )
                      })}
                      {skills.filter(s => !PREDEFINED_SKILLS.includes(s)).map(skill => (
                        <div 
                          key={skill} onClick={() => toggleSkill(skill)}
                          className="cursor-pointer rounded-[8px] border border-[#6B4FD8] bg-[#6B4FD8] px-[12px] py-[6px] font-sans text-[13px] font-semibold text-white shadow-sm transition-all"
                        >
                          {skill} (custom)
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <span className="font-sans text-[13px] text-[#9A8E7E]">or type custom skill:</span>
                      <input 
                        type="text" value={customSkill} onChange={e => setCustomSkill(e.target.value)} onKeyDown={addCustomSkill}
                        placeholder="Press enter to add"
                        className="rounded-[6px] border border-[#E8E5DE] px-[10px] py-[4px] font-sans text-[13px] focus:border-[#6B4FD8] focus:outline-none w-[160px]"
                      />
                    </div>
                  </motion.div>

                  {/* Field 5 */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex flex-col">
                    <label className="font-sans text-[13px] font-semibold text-[#1A1208] mb-[12px]">Are you available right now?</label>
                    <div className="flex flex-wrap gap-[12px]">
                      {AVAILABILITY_OPTS.map(opt => (
                        <div 
                          key={opt.id} onClick={() => setAvailability(opt.id)}
                          className={`cursor-pointer flex items-center gap-[8px] rounded-full border px-[16px] py-[10px] font-sans text-[14px] font-semibold transition-all
                            ${availability === opt.id ? 'bg-[#FAFAF7] border-[#E8E5DE] shadow-sm' : 'border-transparent bg-transparent hover:bg-gray-50'}
                          `}
                          style={availability === opt.id ? { color: opt.color, borderColor: opt.color } : { color: '#9A8E7E' }}
                        >
                          <div className="h-[8px] w-[8px] rounded-full" style={{ backgroundColor: opt.color }} />
                          {opt.id}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                <div className="w-full mt-[48px]">
                  <button 
                    onClick={handleNext}
                    disabled={!isStep2Valid || isSubmitting}
                    className="flex w-full items-center justify-center rounded-[12px] bg-[#0D9488] py-[16px] font-sans text-[16px] font-bold text-white transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-[#0F766E] active:scale-[0.98]"
                  >
                    {isSubmitting ? 'Saving...' : 'Finish setup \u2192'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: WELCOME */}
            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full flex flex-col items-center text-center">
                
                <div className="mb-[32px]">
                  <CheckCircleIcon />
                </div>

                <h2 className="m-0 mb-[16px] font-serif italic text-[40px] text-[#1A1208]">
                  Welcome to IBF, {role === 'founder' ? fName : sName || 'Builder'}.
                </h2>
                
                <p className="m-0 mb-[48px] max-w-[400px] font-sans text-[16px] font-light leading-[1.6] text-[#9A8E7E]">
                  {role === 'founder' 
                    ? "Your founder space is ready. Post your first project and start finding your team."
                    : "Your student space is ready. Discover hundreds of live projects and apply today."
                  }
                </p>

                <button
                  onClick={() => router.push(role === 'founder' ? '/founder/startup' : '/student/discover')}
                  className={`flex w-full items-center justify-center rounded-[12px] py-[16px] font-sans text-[16px] font-bold text-white transition-all active:scale-[0.98]
                    ${role === 'founder' ? 'bg-[#6B4FD8] hover:bg-[#5B3FC8]' : 'bg-[#0D9488] hover:bg-[#0F766E]'}
                  `}
                >
                  {role === 'founder' ? 'Set up my first project →' : 'Explore projects →'}
                </button>

                <button
                  onClick={() => router.push(role === 'founder' ? '/founder/dashboard' : '/student/dashboard')}
                  className="mt-[24px] font-sans text-[14px] font-medium text-[#9A8E7E] hover:text-[#1A1208] transition-colors"
                >
                  Take me to my dashboard
                </button>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
