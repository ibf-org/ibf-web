'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useInView, useMotionValue, animate, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { FolderPlus, Search, Users, Check, ChevronLeft, ChevronRight, Plus, X as XIcon } from 'lucide-react'

// --- Animated Number Component ---
function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0)
  const formatted = useTransform(count, latest => Math.round(latest).toLocaleString())
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  
  useEffect(() => {
    if (inView) {
      animate(count, value, { duration: 2, ease: "easeOut" })
    }
  }, [count, inView, value])
  
  return <motion.span ref={ref}>{formatted}</motion.span>
}

// --- Shared Section Animation ---
const carouselCards = [
  { title: "AI Legal Document Assistant", category: "SaaS", skills: ["React", "LLM", "Node.js"], roles: 2, founder: "Rahul K", color: "#F97316" },
  { title: "Peer Learning Platform", category: "Edtech", skills: ["Python", "Django", "ML"], roles: 3, founder: "Priya M", color: "var(--ibf-secondary)" },
  { title: "Patient Health Dashboard", category: "Healthtech", skills: ["Flutter", "Firebase"], roles: 1, founder: "Arjun S", color: "var(--ibf-primary)" },
  { title: "Sustainable Supply Chain", category: "Climate", skills: ["Data Analysis", "SQL"], roles: 2, founder: "Neha R", color: "#22C55E" },
  { title: "Gaming Community Platform", category: "Social", skills: ["React", "Node.js"], roles: 4, founder: "Vikram T", color: "#EC4899" },
  { title: "Fintech Expense Tracker", category: "Fintech", skills: ["React Native", "Backend"], roles: 2, founder: "Sneha P", color: "#3B82F6" }
];

const faqs = [
  { q: "Is IBF really free?", a: "Yes, completely. No credit card, no trial period, no hidden fees. We believe the best collaboration platforms get out of the way." },
  { q: "I'm a student — do I need experience to apply?", a: "No. Founders on IBF are looking for potential and commitment, not years of experience. Your portfolio and skills matter more than your CV." },
  { q: "How do founders verify student profiles?", a: "Students build their profiles with portfolio links, GitHub, and their university. Founders review these before accepting anyone. Trust is built through transparency." },
  { q: "What happens after a student is accepted?", a: "A private team workspace opens automatically. You get a team chat channel, a task board, and a pinned links panel — everything you need to start building." },
  { q: "Can I post a project if it's just an idea?", a: "Absolutely. Some of the best teams on IBF formed around a sketch on a napkin. Post it. The right people will show up." },
  { q: "Is there a general community chat?", a: "Yes — all users have access to community channels like #for-founders, #for-students, #tech, and #design through the IBF community section." }
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.85 }),
  center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.85, transition: { duration: 0.3 } })
};

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } }
}

export default function LandingPage() {
  const { scrollY } = useScroll()
  const headlineY = useTransform(scrollY, [0, 400], [0, -60])

  // Section 6: Carousel State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % carouselCards.length)
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered])

  const handleNext = () => { setDirection(1); setCurrentIndex(p => (p + 1) % carouselCards.length) }
  const handlePrev = () => { setDirection(-1); setCurrentIndex(p => (p - 1 + carouselCards.length) % carouselCards.length) }

  // Section 7: FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (idx: number) => setOpenFaq(prev => prev === idx ? null : idx);

  // Parallax for Section 3 Setup
  const sec3Ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress: s3Progress } = useScroll({
    target: sec3Ref,
    offset: ["start end", "end start"]
  })
  const card3Y = useTransform(s3Progress, [0, 1], [40, -40])

  // Parallax for Section 4 Setup
  const sec4Ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress: s4Progress } = useScroll({
    target: sec4Ref,
    offset: ["start end", "end start"]
  })
  const card4Y = useTransform(s4Progress, [0, 1], [40, -40])

  return (
    <div className="relative font-['Bricolage_Grotesque',sans-serif] overflow-hidden bg-[var(--ibf-bg)] w-full">
      
      {/* ━━━ SECTION 1: HERO ━━━ */}
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--ibf-bg)]">
        {/* Background Grid */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--ibf-border) 1px, transparent 1px),
              linear-gradient(to bottom, var(--ibf-border) 1px, transparent 1px)
            `,
            backgroundSize: '56px 56px',
            opacity: 0.35,
          }}
        />

        <motion.div 
          className="relative z-10 w-full max-w-[1280px] px-[24px] lg:px-[32px] flex flex-col items-center justify-center pt-24 pb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Eyebrow Pill */}
          <motion.div 
            className="mb-[20px] flex items-center gap-[8px] rounded-[24px] border border-[#C4B5FD] bg-[var(--ibf-primary-light)] px-[16px] py-[6px]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-center">
              <span className="relative flex h-[6px] w-[6px]">
                <span className="absolute inline-flex h-full w-full animate-[ping_2s_ease-in-out_infinite] rounded-full bg-[#22C55E] opacity-75"></span>
                <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-[#22C55E]"></span>
              </span>
            </div>
            <span className="font-['Bricolage_Grotesque',sans-serif] text-[11px] font-semibold text-[#5B21B6] whitespace-nowrap">
              Free for everyone · No credit card ever
            </span>
          </motion.div>

          {/* Headline with Parallax */}
          <motion.div 
            className="mb-[24px] text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ y: headlineY }}
          >
            <h1 className="m-0 flex flex-col items-center text-center font-['Bricolage_Grotesque',sans-serif] font-extrabold leading-[1.0] tracking-[-0.03em] text-ibf-heading text-[40px] md:text-[52px] lg:text-[68px]">
              <span>Your startup idea is</span>
              <span className="font-['Instrument_Serif',serif] italic italic font-normal text-[var(--ibf-primary)] my-1">one conversation</span>
              <span>away from becoming real.</span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            className="mx-auto mb-[32px] max-w-[520px] text-center font-['Bricolage_Grotesque',sans-serif] text-[16px] md:text-[18px] font-light leading-[1.65] text-ibf-muted"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            IBF connects founders who need a team with students who are ready to build. No job boards. No gatekeeping. Just people who needed to find each other.
          </motion.p>

          {/* CTA Row */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-[12px] w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link 
                href="/sign-up" 
                className="flex w-full sm:w-auto items-center justify-center rounded-[10px] bg-[var(--ibf-primary)] px-[32px] py-[14px] font-['Bricolage_Grotesque',sans-serif] text-[15px] font-semibold text-ibf-heading transition-colors"
              >
                I have an idea &rarr;
              </Link>
            </motion.div>
            
            <motion.div 
              whileHover={{ borderColor: 'var(--ibf-primary)', color: 'var(--ibf-primary)', scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              className="rounded-[10px] bg-white border-[1.5px] border-[var(--ibf-border)] text-ibf-heading transition-colors"
            >
              <Link 
                href="/sign-up" 
                className="flex w-full sm:w-auto items-center justify-center px-[32px] py-[14px] font-['Bricolage_Grotesque',sans-serif] text-[15px] font-semibold"
              >
                I want to build
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Row */}
          <motion.div 
            className="mt-[40px] flex flex-wrap items-center justify-center gap-x-[32px] gap-y-[16px] border-t border-[var(--ibf-border)] pt-[28px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-[8px]">
              <span className="font-['Instrument_Serif',serif] italic text-[28px] text-ibf-heading">1,284</span>
              <span className="font-['Bricolage_Grotesque',sans-serif] text-[12px] font-light text-ibf-muted">· projects posted</span>
            </div>
            <div className="flex items-center gap-[8px]">
              <span className="font-['Instrument_Serif',serif] italic text-[28px] text-ibf-heading">4,810</span>
              <span className="font-['Bricolage_Grotesque',sans-serif] text-[12px] font-light text-ibf-muted">· builders ready</span>
            </div>
            <div className="flex items-center gap-[8px]">
              <span className="font-['Instrument_Serif',serif] italic text-[28px] text-ibf-heading">320</span>
              <span className="font-['Bricolage_Grotesque',sans-serif] text-[12px] font-light text-ibf-muted">· teams formed</span>
            </div>
          </motion.div>
        </motion.div>


      </div>


      {/* ━━━ SECTION 2: HOW IT WORKS ━━━ */}
      <section className="bg-[var(--ibf-bg)] py-[120px] px-6 relative z-10 w-full overflow-hidden">
        <div className="max-w-[1280px] mx-auto w-full relative z-10">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants}
            className="flex flex-col items-center justify-center text-center mb-16"
          >
            <div className="font-['Bricolage_Grotesque',sans-serif] font-semibold text-[11px] uppercase tracking-widest text-[var(--ibf-primary)] mb-[12px]">
              Simple by design
            </div>
            <h2 className="font-['Bricolage_Grotesque',sans-serif] font-extrabold text-[40px] md:text-[52px] text-ibf-heading leading-tight m-0">
              Three steps. One team.
            </h2>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[2px]">
            {[
              {
                icon: FolderPlus, num: '1',
                title: 'Post your project',
                desc: 'Describe your idea and the team you need. Takes under 5 minutes. Looks a lot better than a cold DM.'
              },
              {
                icon: Search, num: '2',
                title: 'Students discover you',
                desc: 'Thousands of ambitious builders browse IBF for projects worth their time. Yours will be one of them.'
              },
              {
                icon: Users, num: '3',
                title: 'Your team shows up',
                desc: 'Review profiles, read their applications, and accept the ones who feel right. Then you build.'
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                custom={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: idx * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } }}
                viewport={{ once: true, margin: "-40px" }}
                className="relative bg-[var(--ibf-surface)] border border-[var(--ibf-border)] px-[32px] py-[40px] text-center overflow-hidden group"
              >
                {/* Background Large Number */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-['Instrument_Serif',serif] italic text-[180px] text-[var(--ibf-primary-light)] opacity-30 select-none z-0 pointer-events-none transition-transform duration-700 group-hover:scale-110">
                  {step.num}
                </div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="mb-[24px] flex h-[56px] w-[56px] items-center justify-center rounded-2xl bg-white shadow-sm border border-[var(--ibf-border)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
                    <step.icon size={26} strokeWidth={2} className="text-[var(--ibf-primary)]" />
                  </div>
                  <h3 className="m-0 mb-[12px] font-['Bricolage_Grotesque',sans-serif] font-extrabold text-[22px] text-ibf-heading">{step.title}</h3>
                  <p className="m-0 font-['Bricolage_Grotesque',sans-serif] font-light text-[15px] text-ibf-muted leading-[1.65] max-w-[280px]">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ━━━ SECTION 3: FOR FOUNDERS ━━━ */}
      <section ref={sec3Ref} className="bg-white py-[120px] px-6 relative z-10 w-full overflow-hidden">
        <div className="max-w-[1280px] mx-auto w-full flex flex-col lg:flex-row items-center gap-[60px] lg:gap-[80px]">
          
          {/* Left Text */}
          <motion.div 
            className="flex-1 w-full"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants}
          >
            <div className="font-['Bricolage_Grotesque',sans-serif] font-semibold text-[14px] text-[var(--ibf-primary)] mb-[20px]">For founders</div>
            <h2 className="m-0 mb-[24px] font-['Bricolage_Grotesque',sans-serif] font-extrabold text-[36px] md:text-[44px] leading-[1.1] text-ibf-heading">
              Most founders fail because they tried to build <span className="font-['Instrument_Serif',serif] italic italic font-normal">alone.</span>
            </h2>
            <p className="m-0 mb-[32px] font-['Bricolage_Grotesque',sans-serif] font-light text-[16px] text-ibf-muted leading-[1.65]">
              IBF is where the right people find each other — before the product, before the funding, before everything else. Post your project. Your team is already here.
            </p>
            
            <div className="flex flex-col gap-[16px] mb-[40px]">
              {[
                'Post in minutes',
                'Zero recruiter fees',
                'Real student portfolios',
                'Team workspace included'
              ].map((bullet, i) => (
                <div key={i} className="flex items-center gap-[12px]">
                  <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[var(--ibf-primary-light)] text-[var(--ibf-primary)]">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="font-['Bricolage_Grotesque',sans-serif] font-medium text-[15px] text-ibf-heading">{bullet}</span>
                </div>
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
              <Link href="/sign-up" className="inline-flex items-center justify-center rounded-[10px] bg-[var(--ibf-primary)] px-[32px] py-[14px] font-['Bricolage_Grotesque',sans-serif] text-[15px] font-semibold text-ibf-heading transition-colors">
                Post your first project &rarr;
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Mockup */}
          <motion.div 
            className="flex-1 w-full relative"
            style={{ y: card3Y }}
            initial={{ x: 60, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          >
            {/* The Mockup Card */}
            <div className="rounded-[16px] border border-[var(--ibf-border)] bg-white p-[24px] shadow-[0_8px_40px_rgba(26,18,8,0.08)] mx-auto w-full max-w-[460px]">
              <div className="mb-6 border-b border-[var(--ibf-border)] pb-4">
                <div className="font-['Bricolage_Grotesque',sans-serif] text-[13px] font-bold text-ibf-heading">New Project</div>
              </div>
              
              <div className="flex flex-col gap-[20px]">
                {/* Input mock */}
                <div>
                  <div className="font-['Bricolage_Grotesque',sans-serif] text-[11px] font-semibold uppercase tracking-wider text-ibf-muted mb-[8px]">Project Name</div>
                  <div className="rounded-[8px] border border-[var(--ibf-border)] bg-[var(--ibf-bg)] px-[16px] py-[12px] flex items-center">
                    <span className="font-['Bricolage_Grotesque',sans-serif] text-[14px] text-ibf-heading font-medium">AI Legal Document Assistant</span>
                    <span className="w-[2px] h-[16px] bg-[var(--ibf-primary)] ml-[2px] animate-pulse rounded-full"></span>
                  </div>
                </div>

                {/* Stage Selection */}
                <div>
                  <div className="font-['Bricolage_Grotesque',sans-serif] text-[11px] font-semibold uppercase tracking-wider text-ibf-muted mb-[8px]">Stage</div>
                  <div className="grid grid-cols-4 gap-[8px]">
                    {['Idea', 'Prototype', 'MVP', 'Beta'].map((stage) => (
                      <div 
                        key={stage} 
                        className={`rounded-[8px] border py-[8px] text-center font-['Bricolage_Grotesque',sans-serif] text-[12px] font-medium transition-colors ${
                          stage === 'MVP' ? 'border-[var(--ibf-primary)] bg-[var(--ibf-primary-light)] text-[var(--ibf-primary)]' : 'border-[var(--ibf-border)] bg-white text-ibf-muted'
                        }`}
                      >
                        {stage}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Roles mock */}
                <div>
                  <div className="font-['Bricolage_Grotesque',sans-serif] text-[11px] font-semibold uppercase tracking-wider text-ibf-muted mb-[8px]">Roles Needed</div>
                  <div className="flex flex-wrap gap-[8px]">
                    {['Frontend Dev', 'ML Engineer'].map(role => (
                      <div key={role} className="flex items-center gap-[4px] rounded-[100px] border border-[#C4B5FD] bg-[var(--ibf-primary-light)] pl-[12px] pr-[8px] py-[4px]">
                        <span className="font-['Bricolage_Grotesque',sans-serif] text-[12px] font-semibold text-[#5B21B6]">{role}</span>
                        <div className="flex h-[16px] w-[16px] items-center justify-center rounded-full hover:bg-[#C4B5FD] cursor-pointer text-[#5B21B6]">×</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button mock */}
                <div className="mt-[16px] rounded-[8px] bg-[var(--ibf-primary)] py-[14px] text-center font-['Bricolage_Grotesque',sans-serif] text-[14px] font-semibold text-ibf-heading shadow-sm opacity-90 transition-opacity hover:opacity-100 cursor-pointer">
                  Post project
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* ━━━ SECTION 4: FOR STUDENTS ━━━ */}
      <section ref={sec4Ref} className="bg-[var(--ibf-surface)] py-[120px] px-6 relative z-10 w-full overflow-hidden">
        <div className="max-w-[1280px] mx-auto w-full flex flex-col-reverse lg:flex-row items-center gap-[60px] lg:gap-[80px]">
          
          {/* Left Mockup */}
          <motion.div 
            className="flex-1 w-full relative"
            style={{ y: card4Y }}
            initial={{ x: -60, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          >
            <div className="relative rounded-[16px] border border-[var(--ibf-border)] bg-white p-[24px] shadow-[0_8px_40px_rgba(26,18,8,0.08)] mx-auto w-full max-w-[460px] overflow-hidden min-h-[440px]">
              {/* Fake Search */}
              <div className="mb-6 flex items-center rounded-full border border-[var(--ibf-border)] bg-[var(--ibf-bg)] px-[16px] py-[12px]">
                <Search size={16} className="text-ibf-muted mr-[12px]" />
                <span className="font-['Bricolage_Grotesque',sans-serif] text-[14px] text-ibf-heading font-medium">React developer...</span>
                <span className="w-[1.5px] h-[16px] bg-[var(--ibf-secondary)] ml-[2px] animate-pulse"></span>
              </div>

              {/* Cards wrapper to simulate scroll */}
              <div className="flex flex-col gap-[16px]">
                {/* Fake Project 1 */}
                <div className="rounded-[12px] border border-[var(--ibf-border)] bg-white p-[16px]">
                  <div className="flex items-center gap-[12px] mb-[12px]">
                    <div className="h-[32px] w-[32px] rounded-lg bg-[var(--ibf-secondary-light)] border border-[var(--ibf-secondary)]/20 flex items-center justify-center font-['Bricolage_Grotesque',sans-serif] font-bold text-[var(--ibf-secondary)] text-[14px]">S</div>
                    <div>
                      <div className="font-['Bricolage_Grotesque',sans-serif] text-[14px] font-bold text-ibf-heading">SaaS Automation Tool</div>
                      <div className="font-['Bricolage_Grotesque',sans-serif] text-[11px] text-ibf-muted">Looking for React experts</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-[6px] mb-[16px]">
                    {['React', 'Next.js', 'Tailwind'].map(tag => (
                      <span key={tag} className="rounded-md bg-[var(--ibf-bg)] border border-[var(--ibf-border)] px-[6px] py-[2px] font-['Bricolage_Grotesque',sans-serif] text-[10px] text-ibf-body">{tag}</span>
                    ))}
                  </div>
                  <div className="rounded-[6px] bg-[var(--ibf-secondary)]/10 text-[var(--ibf-secondary)] py-[8px] text-center font-['Bricolage_Grotesque',sans-serif] text-[12px] font-semibold">
                    Apply Now
                  </div>
                </div>

                {/* Fake Project 2 (offset simulating scroll) */}
                <motion.div 
                  initial={{ y: 80, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="rounded-[12px] border border-[var(--ibf-border)] bg-white p-[16px] relative shadow-lg"
                >
                  {/* Decorative tag */}
                  <div className="absolute top-[-10px] right-[16px] rounded bg-[#22C55E] px-2 py-0.5 text-[9px] font-bold text-ibf-heading uppercase tracking-wider">New</div>
                  <div className="flex items-center gap-[12px] mb-[12px]">
                    <div className="h-[32px] w-[32px] rounded-lg bg-[#FEE2E2] border border-[#EF4444]/20 flex items-center justify-center font-['Bricolage_Grotesque',sans-serif] font-bold text-[#EF4444] text-[14px]">H</div>
                    <div>
                      <div className="font-['Bricolage_Grotesque',sans-serif] text-[14px] font-bold text-ibf-heading">Health Connect App</div>
                      <div className="font-['Bricolage_Grotesque',sans-serif] text-[11px] text-ibf-muted">Frontend UI needed</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-[6px] mb-[12px]">
                    {['React Native', 'TypeScript'].map(tag => (
                      <span key={tag} className="rounded-md bg-[var(--ibf-bg)] border border-[var(--ibf-border)] px-[6px] py-[2px] font-['Bricolage_Grotesque',sans-serif] text-[10px] text-ibf-body">{tag}</span>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Bottom fade gradient */}
              <div className="absolute bottom-0 left-0 w-full h-[60px] bg-gradient-to-t from-white to-transparent" />
            </div>
          </motion.div>

          {/* Right Text */}
          <motion.div 
            className="flex-1 w-full lg:pr-8"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants}
          >
            <div className="font-['Bricolage_Grotesque',sans-serif] font-semibold text-[14px] text-[var(--ibf-secondary)] mb-[20px]">For students</div>
            <h2 className="m-0 mb-[24px] font-['Bricolage_Grotesque',sans-serif] font-extrabold text-[36px] md:text-[44px] leading-[1.1] text-ibf-heading">
              Your degree teaches you <span className="font-['Instrument_Serif',serif] italic italic font-normal text-[var(--ibf-secondary)]">how.</span> <br/>
              IBF gives you <span className="font-['Instrument_Serif',serif] italic italic font-normal text-[var(--ibf-secondary)]">what to build.</span>
            </h2>
            <p className="m-0 mb-[32px] font-['Bricolage_Grotesque',sans-serif] font-light text-[16px] text-ibf-muted leading-[1.65]">
              Real projects. Real founders who actually need you. Real experience that shows up in a portfolio — not just a certificate that shows up in a drawer.
            </p>
            
            <div className="flex flex-col gap-[16px] mb-[40px]">
              {[
                'Browse 1,000+ live projects',
                'Apply in one click',
                'Build your public portfolio',
                'Get endorsed by founders'
              ].map((bullet, i) => (
                <div key={i} className="flex items-center gap-[12px]">
                  <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[var(--ibf-secondary-light)] text-[var(--ibf-secondary)]">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="font-['Bricolage_Grotesque',sans-serif] font-medium text-[15px] text-ibf-heading">{bullet}</span>
                </div>
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
              <Link href="/sign-up" className="inline-flex items-center justify-center rounded-[10px] bg-[var(--ibf-secondary)] px-[32px] py-[14px] font-['Bricolage_Grotesque',sans-serif] text-[15px] font-semibold text-ibf-heading transition-colors">
                Find your first project &rarr;
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </section>


      {/* ━━━ SECTION 5: NUMBERS / SOCIAL PROOF ━━━ */}
      <section className="bg-[var(--ibf-surface)] py-[100px] px-6 relative w-full border-t border-[var(--ibf-border)] overflow-hidden">
        <div className="max-w-[1280px] mx-auto w-full relative z-10">
          
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}
            className="text-center mb-[80px]"
          >
            <h2 className="m-0 font-['Instrument_Serif',serif] italic italic text-[40px] md:text-[48px] text-ibf-heading">
              Where ideas stop being ideas.
            </h2>
          </motion.div>

          {/* Numbers Grid */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-y-12 w-full mb-[100px]"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}
          >
            {[
              { val: 1284, label: 'projects posted' },
              { val: 4810, label: 'builders' },
              { val: 320, label: 'teams formed' },
              { val: 28, label: 'cities' }
            ].map((stat, i) => (
              <div 
                key={i} 
                className={`flex flex-col items-center justify-center text-center ${
                  i < 3 ? 'md:border-r md:border-[var(--ibf-border)]' : ''
                }`}
              >
                <div className="font-['Instrument_Serif',serif] italic text-[48px] md:text-[64px] text-ibf-heading leading-none mb-[8px]">
                  <AnimatedNumber value={stat.val} />
                </div>
                <div className="font-['Bricolage_Grotesque',sans-serif] font-light text-[13px] md:text-[14px] text-ibf-muted">
                  · {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Quotes Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
            {[
              { 
                text: "Found my co-founder on IBF in 3 days. We've been building for 6 months now.",
                author: "Rohan K.", role: "Founder" 
              },
              { 
                text: "First real project on my portfolio came from IBF. Got a job offer because of it.",
                author: "Priya S.", role: "Student" 
              },
              { 
                text: "I posted a role for a UI designer and had 8 applications in 48 hours.",
                author: "Arjun M.", role: "Founder" 
              }
            ].map((quote, idx) => (
              <motion.div
                key={idx}
                className="bg-white border border-[var(--ibf-border)] shadow-sm rounded-[12px] p-[24px] flex flex-col justify-between"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                whileHover={{ y: -5, backgroundColor: "var(--ibf-surface)", transition: { duration: 0.2 } }}
              >
                <p className="m-0 font-['Instrument_Serif',serif] italic italic text-[16px] text-ibf-heading leading-[1.6] mb-[20px]">
                  &quot;{quote.text}&quot;
                </p>
                <div className="font-['Bricolage_Grotesque',sans-serif] font-normal text-[12px] text-ibf-muted">
                  <span className="text-ibf-heading font-medium">{quote.author}</span>, {quote.role}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ━━━ SECTION 6: LIVE PROJECTS CAROUSEL ━━━ */}
      <section className="bg-[var(--ibf-bg)] py-[100px] px-6 relative w-full overflow-hidden">
        <div className="max-w-[1280px] mx-auto w-full relative z-10">
          
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}
            className="text-center mb-[60px]"
          >
            <div className="font-['Bricolage_Grotesque',sans-serif] font-semibold text-[11px] uppercase tracking-widest text-[var(--ibf-primary)] mb-[12px]">
              Live right now
            </div>
            <h2 className="m-0 font-['Bricolage_Grotesque',sans-serif] font-extrabold text-[40px] md:text-[48px] text-ibf-heading leading-tight">
              Projects looking for <span className="font-['Instrument_Serif',serif] italic italic font-normal text-[var(--ibf-primary)]">someone like you.</span>
            </h2>
          </motion.div>

          <div 
            className="relative h-[480px] w-full flex items-center justify-center overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Nav Left */}
            <button 
              onClick={handlePrev}
              className="absolute left-0 md:left-[5%] z-20 flex h-[48px] w-[48px] items-center justify-center rounded-full border border-[var(--ibf-border)] bg-white text-ibf-heading shadow-sm transition-all hover:border-[#C4B5FD] hover:bg-[var(--ibf-primary-light)] active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Carousel Track */}
            <div className="relative w-full max-w-[320px] h-full flex items-center justify-center">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = offset.x;
                    if (swipe < -50) handleNext();
                    else if (swipe > 50) handlePrev();
                  }}
                  className="absolute w-full h-[380px] cursor-grab active:cursor-grabbing z-10"
                >
                  <div className="flex h-full w-full flex-col overflow-hidden rounded-[16px] border-[1.5px] border-[var(--ibf-border)] bg-white p-[24px] shadow-[0_8px_40px_rgba(26,18,8,0.06)]">
                    <div 
                      className="mb-[20px] flex h-[60px] w-full items-center justify-center rounded-[8px]"
                      style={{ background: `linear-gradient(135deg, ${carouselCards[currentIndex].color}20, ${carouselCards[currentIndex].color}50)` }}
                    >
                      <span className="rounded-full bg-white px-[12px] py-[4px] font-['Bricolage_Grotesque',sans-serif] text-[11px] font-extrabold uppercase tracking-wider text-ibf-heading shadow-sm">
                        {carouselCards[currentIndex].category}
                      </span>
                    </div>

                    <h3 className="m-0 mb-[8px] font-['Bricolage_Grotesque',sans-serif] text-[18px] font-extrabold text-ibf-heading leading-tight">
                      {carouselCards[currentIndex].title}
                    </h3>

                    <div className="mb-[16px] font-['Bricolage_Grotesque',sans-serif] text-[13px] text-ibf-muted flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-full bg-[var(--ibf-border)] flex items-center justify-center font-bold text-[9px] text-ibf-heading uppercase">
                        {carouselCards[currentIndex].founder.charAt(0)}
                      </div>
                      Founder: <span className="font-medium text-ibf-heading">{carouselCards[currentIndex].founder}</span>
                    </div>

                    <div className="mb-[24px] flex flex-wrap gap-[6px]">
                      {carouselCards[currentIndex].skills.map(skill => (
                        <span key={skill} className="rounded-full bg-[var(--ibf-primary-light)] px-[10px] py-[4px] font-['Bricolage_Grotesque',sans-serif] text-[11px] font-semibold text-[var(--ibf-primary)]">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-[var(--ibf-border)] pt-[20px]">
                      <div className="font-['Bricolage_Grotesque',sans-serif] text-[12px] font-medium text-ibf-muted">
                        {carouselCards[currentIndex].roles} role{carouselCards[currentIndex].roles > 1 ? 's' : ''} open
                      </div>
                      <Link href="/sign-up" className="rounded-[8px] bg-[var(--ibf-primary)] px-[16px] py-[8px] font-['Bricolage_Grotesque',sans-serif] text-[13px] font-semibold text-ibf-heading transition-colors hover:bg-[#5B3FC8]">
                        Apply &rarr;
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Pseudo side-cards */}
              <div className="absolute left-[-260px] hidden md:block w-full h-[380px] rounded-[16px] border-[1.5px] border-[var(--ibf-border)] bg-white opacity-60 pointer-events-none scale-[0.85] transition-all" />
              <div className="absolute right-[-260px] hidden md:block w-full h-[380px] rounded-[16px] border-[1.5px] border-[var(--ibf-border)] bg-white opacity-60 pointer-events-none scale-[0.85] transition-all" />
            </div>

            {/* Nav Right */}
            <button 
              onClick={handleNext}
              className="absolute right-0 md:right-[5%] z-20 flex h-[48px] w-[48px] items-center justify-center rounded-full border border-[var(--ibf-border)] bg-white text-ibf-heading shadow-sm transition-all hover:border-[#C4B5FD] hover:bg-[var(--ibf-primary-light)] active:scale-95"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-[8px] mt-[10px]">
            {carouselCards.map((_, i) => (
              <button 
                key={i} 
                onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i) }}
                className={`h-[8px] rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-[24px] bg-[var(--ibf-primary)]' : 'w-[8px] bg-[var(--ibf-border)] hover:bg-[#C4B5FD]'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ SECTION 7: FAQ ━━━ */}
      <section className="bg-[var(--ibf-surface)] py-[80px] px-6 relative w-full border-t border-[var(--ibf-border)]">
        <div className="max-w-[700px] mx-auto w-full relative z-10">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}
          >
            <h2 className="m-0 mb-[40px] text-center font-['Bricolage_Grotesque',sans-serif] font-extrabold text-[32px] md:text-[40px] text-ibf-heading">
              Common questions.
            </h2>

            <div className="flex flex-col">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-[var(--ibf-border)] last:border-b-0">
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="flex w-full items-center justify-between py-[20px] text-left focus:outline-none group"
                  >
                    <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[16px] text-ibf-heading group-hover:text-[var(--ibf-primary)] transition-colors">{faq.q}</span>
                    <motion.span 
                      animate={{ rotate: openFaq === idx ? 45 : 0 }} 
                      className="ml-[16px] shrink-0 text-[var(--ibf-primary)]"
                    >
                      <Plus size={18} />
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="m-0 pb-[20px] pr-[30px] font-['Bricolage_Grotesque',sans-serif] font-light text-[15px] leading-[1.7] text-ibf-muted">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ SECTION 8: FINAL CTA ━━━ */}
      <section className="bg-[var(--ibf-primary)] py-[100px] px-6 relative w-full overflow-hidden">
        {/* Floating Background Particles */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                width: `${4 + (i % 3) * 2}px`,
                height: `${4 + (i % 3) * 2}px`,
                left: `${(i * 19) % 100}%`,
                top: `${(i * 13) % 100}%`,
              }}
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: [3, 4, 5][i % 3],
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="max-w-[800px] mx-auto w-full relative z-10 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
            <div className="inline-flex rounded-full border border-white/30 bg-white/10 px-[16px] py-[6px] mb-[24px]">
              <span className="font-['Bricolage_Grotesque',sans-serif] text-[11px] font-extrabold uppercase tracking-widest text-ibf-heading backdrop-blur-md">
                Ready to start?
              </span>
            </div>
            
            <h2 className="m-0 mb-[20px] font-['Instrument_Serif',serif] italic italic text-[48px] md:text-[56px] text-ibf-heading">
              Your team is already here.
            </h2>
            
            <p className="m-0 mx-auto mb-[40px] max-w-[500px] font-['Bricolage_Grotesque',sans-serif] text-[16px] md:text-[18px] font-light leading-[1.6] text-ibf-heading/80">
              Thousands of founders and students are on IBF right now. The only thing missing is you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-[16px] mb-[40px]">
              <Link href="/sign-up" className="flex w-full sm:w-auto items-center justify-center rounded-[10px] bg-white px-[32px] py-[16px] font-['Bricolage_Grotesque',sans-serif] text-[16px] font-bold text-[var(--ibf-primary)] transition-transform hover:scale-105 active:scale-95 shadow-xl">
                Post your project
              </Link>
              <Link href="/sign-up" className="flex w-full sm:w-auto items-center justify-center rounded-[10px] border border-white/40 bg-transparent px-[32px] py-[16px] font-['Bricolage_Grotesque',sans-serif] text-[16px] font-bold text-ibf-heading transition-all hover:bg-white/10 active:scale-95">
                Find a project
              </Link>
            </div>

            <div className="font-['Bricolage_Grotesque',sans-serif] text-[13px] font-light text-ibf-heading/50">
              Free forever · No credit card · Join in 60 seconds
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="bg-[var(--ibf-heading)] pt-[80px] pb-[40px] px-6">
        <div className="max-w-[1280px] mx-auto w-full">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#2a2010] pb-[40px] mb-[40px] gap-[32px]">
            {/* Logo Left */}
            <div>
              <Link href="/" className="font-['Bricolage_Grotesque',sans-serif] font-extrabold text-[24px] text-ibf-heading no-underline">
                IBF<span className="text-[var(--ibf-primary)]">.</span>
              </Link>
              <p className="mt-[8px] font-['Bricolage_Grotesque',sans-serif] text-[13px] font-light text-ibf-muted">
                Innovators Bridge Foundry
              </p>
            </div>

            {/* Links Right */}
            <div className="flex flex-wrap gap-[24px] md:gap-[40px]">
              {['For founders', 'For students', 'Community', 'About', 'FAQ'].map(link => (
                <Link key={link} href="/sign-up" className="font-['Bricolage_Grotesque',sans-serif] text-[14px] font-medium text-ibf-muted hover:text-ibf-heading transition-colors">
                  {link}
                </Link>
              ))}
            </div>
          </div>

          <div className="text-center font-['Bricolage_Grotesque',sans-serif] text-[12px] font-light text-ibf-muted">
            © {new Date().getFullYear()} IBF — Innovators Bridge Foundry. Free for everyone, forever.
          </div>
        </div>
      </footer>

    </div>
  )
}
