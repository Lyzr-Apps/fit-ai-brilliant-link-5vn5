'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { callAIAgent, type AIAgentResponse } from '@/lib/aiAgent'
import {
  RiDashboardLine, RiRobot2Line, RiArticleLine, RiUserLine, RiShieldUserLine,
  RiHeartPulseLine, RiCalculatorLine, RiFireLine, RiTrophyLine, RiScales2Line,
  RiSendPlaneLine, RiMenuLine, RiCloseLine, RiArrowUpLine, RiArrowDownLine,
  RiSearchLine, RiStarFill, RiTimeLine, RiBookOpenLine, RiEditLine,
  RiDeleteBinLine, RiEyeLine, RiEyeOffLine, RiCheckLine,
  RiArrowLeftLine, RiArrowRightLine,
  RiLeafLine, RiRunLine, RiFlashlightLine, RiChat3Line, RiInformationLine,
  RiLightbulbLine, RiAlertLine, RiLoader4Line
} from 'react-icons/ri'

// ── Agent IDs ──
const DIET_PLAN_AGENT_ID = "69996137730bbd74d53e89d5"
const HEALTH_CALCULATOR_AGENT_ID = "69996137730bbd74d53e89d7"
const AI_CHATBOT_AGENT_ID = "69996137a63b170a3b8170e3"

// ── Types ──
interface DietPlanResponse {
  plan_title: string
  overview: string
  daily_calories_target: number
  weekly_plan: {
    day: string
    meals: {
      meal_type: string
      meal_name: string
      ingredients: string[]
      calories: number
      protein_g: number
      carbs_g: number
      fats_g: number
    }[]
    daily_total: { calories: number; protein_g: number; carbs_g: number; fats_g: number }
  }[]
  tips: string[]
}

interface HealthCalcResponse {
  bmi: { value: number; category: string; healthy_range: string }
  bmr: number
  tdee: number
  calorie_recommendations: { maintain: number; mild_loss: number; weight_loss: number; mild_gain: number; weight_gain: number }
  insights: string[]
  recommendations: string[]
}

interface ChatMessage {
  role: 'user' | 'bot'
  text: string
  suggestions?: string[]
  disclaimer?: string
}

interface BlogPost {
  id: number
  title: string
  excerpt: string
  body: string
  category: string
  author: string
  date: string
  readTime: string
  color: string
}

interface MockUser {
  id: number
  name: string
  email: string
  role: string
  status: string
  joined: string
}

type Screen = 'landing' | 'dashboard' | 'dietplan' | 'aitools' | 'blog' | 'profile' | 'admin'

// ── Colors ──
const C = {
  bg: '#0d0812',
  fg: '#f2eff5',
  card: '#130e1a',
  secondary: '#211a2b',
  accent: '#6b2fd4',
  muted: '#291f36',
  mutedFg: '#9e8fad',
  border: '#291f36',
  input: '#372b47',
  ring: '#6b2fd4',
  destructive: '#7f1d1d',
  sidebarBg: '#100b17',
  sidebarBorder: '#1f1729',
  sidebarAccent: '#1f1729',
}

// ── Mock Data ──
const BLOG_POSTS: BlogPost[] = [
  { id: 1, title: 'The Science Behind High-Intensity Interval Training', excerpt: 'Discover how HIIT workouts maximize fat burn and improve cardiovascular health in less time than traditional cardio.', body: 'High-Intensity Interval Training (HIIT) has revolutionized the fitness world. By alternating between intense bursts of activity and fixed periods of less-intense activity or rest, HIIT maximizes calorie burn in minimal time.\n\nResearch shows that HIIT can burn 25-30% more calories than other forms of exercise. The afterburn effect (EPOC) means your body continues to burn calories for hours after the workout.\n\nA typical HIIT session lasts 15-30 minutes and can include exercises like sprints, burpees, jumping jacks, and mountain climbers. The key is pushing to 80-95% of your maximum heart rate during intense intervals.\n\nBenefits include improved insulin sensitivity, enhanced mitochondrial function, and increased VO2 max. However, proper form and adequate rest between sessions are crucial to prevent injury.\n\nFor beginners, start with a 1:2 work-to-rest ratio (e.g., 20 seconds of work, 40 seconds of rest) and gradually progress to a 1:1 ratio as fitness improves.', category: 'Workout', author: 'Dr. Sarah Chen', date: '2025-01-15', readTime: '5 min', color: '#6b2fd4' },
  { id: 2, title: 'Understanding Macros: A Complete Guide to Macronutrients', excerpt: 'Learn how to balance proteins, carbs, and fats for optimal performance and body composition.', body: 'Macronutrients are the three main categories of nutrients that provide your body with energy: proteins, carbohydrates, and fats.\n\nProteins (4 cal/g) are essential for muscle repair and growth. Aim for 0.7-1g per pound of bodyweight for active individuals. Quality sources include lean meats, fish, eggs, and legumes.\n\nCarbohydrates (4 cal/g) are your body\'s preferred energy source. Complex carbs from whole grains, vegetables, and fruits provide sustained energy. Simple carbs are best consumed around workouts.\n\nFats (9 cal/g) support hormone production, brain function, and nutrient absorption. Focus on unsaturated fats from avocados, nuts, olive oil, and fatty fish.\n\nA balanced macro split might look like 40% carbs, 30% protein, 30% fat, but this varies based on goals. For fat loss, higher protein helps preserve muscle. For endurance athletes, more carbs fuel performance.\n\nTracking macros initially helps build awareness of portion sizes and food composition, even if you don\'t track long-term.', category: 'Nutrition', author: 'Mike Johnson', date: '2025-01-10', readTime: '7 min', color: '#9333ea' },
  { id: 3, title: 'Sleep and Recovery: The Missing Piece of Your Fitness Puzzle', excerpt: 'Why quality sleep is just as important as your workouts and diet for achieving fitness goals.', body: 'Sleep is often overlooked in fitness plans, but it\'s when your body does most of its repair and recovery work.\n\nDuring deep sleep, growth hormone is released, promoting muscle repair and growth. Sleep deprivation can reduce testosterone levels by up to 15% and increase cortisol, leading to muscle breakdown and fat storage.\n\nAim for 7-9 hours of quality sleep per night. Establish a consistent sleep schedule, even on weekends. Create a dark, cool sleeping environment (65-68F is optimal).\n\nPre-sleep habits matter: avoid screens 1 hour before bed, limit caffeine after 2pm, and consider magnesium supplementation. A light protein snack (casein) before bed can support overnight muscle protein synthesis.\n\nSigns of poor recovery include persistent soreness, plateauing performance, increased resting heart rate, and mood disturbances. Listen to your body and prioritize rest days.\n\nActive recovery (light walking, stretching, yoga) on rest days promotes blood flow and can speed recovery without adding training stress.', category: 'Recovery', author: 'Dr. Lisa Park', date: '2025-01-05', readTime: '6 min', color: '#7c3aed' },
  { id: 4, title: 'Building a Home Gym on a Budget', excerpt: 'Essential equipment and creative solutions for effective home workouts without breaking the bank.', body: 'You don\'t need a commercial gym to get in great shape. A well-planned home gym can be built for under $300.\n\nEssential equipment tier 1 ($50-100): Resistance bands (multiple tensions), a yoga mat, and a jump rope. These cover cardio, strength, and flexibility training.\n\nTier 2 ($100-200): Add adjustable dumbbells or a kettlebell set. A pull-up bar that fits in a doorframe is one of the best investments for upper body training.\n\nTier 3 ($200-300): Consider a stability ball, TRX suspension trainer, or foam roller for advanced training and recovery.\n\nSpace-saving tips: Wall-mounted storage, foldable equipment, and multi-purpose items maximize small spaces. A 6x6 foot area is sufficient for most exercises.\n\nBodyweight exercises remain king: push-ups, squats, lunges, planks, and burpees require zero equipment and can be endlessly varied for progressive overload.\n\nOnline resources and apps provide structured programming, eliminating the need for a personal trainer for most fitness levels.', category: 'Equipment', author: 'Tom Richards', date: '2024-12-28', readTime: '5 min', color: '#a855f7' },
  { id: 5, title: 'Mindful Eating: Transform Your Relationship with Food', excerpt: 'Practical strategies for developing healthy eating habits that last a lifetime.', body: 'Mindful eating is the practice of paying full attention to the experience of eating and drinking. It\'s not a diet but a way of approaching food that can naturally lead to healthier choices.\n\nStart by eating without distractions. Turn off screens, sit at a table, and focus on your meal. Notice the colors, smells, textures, and flavors of your food.\n\nChew slowly and thoroughly. It takes about 20 minutes for satiety signals to reach your brain. Eating slowly helps prevent overeating and improves digestion.\n\nLearn to distinguish physical hunger from emotional hunger. Physical hunger comes on gradually and can be satisfied by various foods. Emotional hunger is sudden, craves specific comfort foods, and isn\'t satisfied by fullness.\n\nPractice the hunger scale: rate your hunger from 1 (starving) to 10 (stuffed). Aim to eat at 3-4 and stop at 6-7. This prevents both under-eating and over-eating.\n\nPortion awareness without strict measuring: use your hand as a guide. A palm-size serving of protein, a fist of vegetables, a cupped hand of carbs, and a thumb of fats at each meal.', category: 'Nutrition', author: 'Dr. Amy Zhao', date: '2024-12-20', readTime: '6 min', color: '#c084fc' },
]

const MOCK_USERS: MockUser[] = [
  { id: 1, name: 'Alex Turner', email: 'alex@example.com', role: 'User', status: 'Active', joined: '2025-01-01' },
  { id: 2, name: 'Jamie Lee', email: 'jamie@example.com', role: 'User', status: 'Active', joined: '2025-01-05' },
  { id: 3, name: 'Morgan Smith', email: 'morgan@example.com', role: 'Admin', status: 'Active', joined: '2024-12-15' },
  { id: 4, name: 'Casey Brown', email: 'casey@example.com', role: 'User', status: 'Disabled', joined: '2024-11-20' },
  { id: 5, name: 'Riley Davis', email: 'riley@example.com', role: 'User', status: 'Active', joined: '2025-01-12' },
]

const WEIGHT_HISTORY = [
  { week: 'W1', value: 85 },
  { week: 'W2', value: 84.2 },
  { week: 'W3', value: 83.8 },
  { week: 'W4', value: 83.1 },
  { week: 'W5', value: 82.5 },
  { week: 'W6', value: 82.0 },
  { week: 'W7', value: 81.3 },
  { week: 'W8', value: 80.8 },
]

// ── Helper ──
function parseAgentResult(result: AIAgentResponse) {
  if (!result.success) return null
  let data = result.response?.result
  if (typeof data === 'string') {
    try { data = JSON.parse(data) } catch { return null }
  }
  return data
}

// ══════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl ${className}`} style={{ background: C.muted }} />
}

function SkeletonBlock() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

// ── Sidebar ──
function Sidebar({ screen, setScreen, open, setOpen }: {
  screen: Screen; setScreen: (s: Screen) => void; open: boolean; setOpen: (b: boolean) => void
}) {
  const items: { key: Screen; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <RiDashboardLine size={20} /> },
    { key: 'dietplan', label: 'Diet Planning', icon: <RiLeafLine size={20} /> },
    { key: 'aitools', label: 'AI Tools', icon: <RiRobot2Line size={20} /> },
    { key: 'blog', label: 'Blog', icon: <RiArticleLine size={20} /> },
    { key: 'profile', label: 'Profile', icon: <RiUserLine size={20} /> },
    { key: 'admin', label: 'Admin', icon: <RiShieldUserLine size={20} /> },
  ]

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
      )}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 transition-transform duration-300 ease-in-out lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: C.sidebarBg, borderRight: `1px solid ${C.sidebarBorder}` }}
      >
        <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: `1px solid ${C.sidebarBorder}` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.accent }}>
            <RiFlashlightLine size={20} color="#fff" />
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ color: C.fg }}>FitVerse</span>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)} style={{ color: C.mutedFg }}>
            <RiCloseLine size={22} />
          </button>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {items.map(item => {
            const active = screen === item.key
            return (
              <button
                key={item.key}
                onClick={() => { setScreen(item.key); setOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: active ? C.sidebarAccent : 'transparent',
                  color: active ? C.accent : C.mutedFg,
                  borderLeft: active ? `3px solid ${C.accent}` : '3px solid transparent',
                }}
              >
                {item.icon}
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="absolute bottom-4 left-3 right-3">
          <button
            onClick={() => { setScreen('landing'); setOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
            style={{ color: C.mutedFg }}
          >
            <RiArrowLeftLine size={20} />
            Back to Home
          </button>
        </div>
      </aside>
    </>
  )
}

// ── Top Header ──
function TopHeader({ setOpen, screen }: { setOpen: (b: boolean) => void; screen: Screen }) {
  const titles: Record<Screen, string> = {
    landing: '', dashboard: 'Dashboard', dietplan: 'AI Diet Planning', aitools: 'AI Tools', blog: 'Blog', profile: 'Profile', admin: 'Admin Panel',
  }
  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-4 px-6 py-4"
      style={{ background: `${C.bg}e6`, borderBottom: `1px solid ${C.border}`, backdropFilter: 'blur(12px)' }}
    >
      <button className="lg:hidden" onClick={() => setOpen(true)} style={{ color: C.fg }}>
        <RiMenuLine size={24} />
      </button>
      <h1 className="text-lg font-bold tracking-tight" style={{ color: C.fg }}>{titles[screen]}</h1>
      <div className="ml-auto flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: C.accent, color: '#fff' }}>
          FV
        </div>
      </div>
    </header>
  )
}

// ── Stat Card ──
function StatCard({ icon, label, value, trend, trendUp }: {
  icon: React.ReactNode; label: string; value: string; trend: string; trendUp: boolean
}) {
  return (
    <div className="rounded-xl p-5 transition-all duration-200 hover:scale-[1.02]" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.secondary }}>
          {icon}
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
          {trendUp ? <RiArrowUpLine size={14} /> : <RiArrowDownLine size={14} />}
          {trend}
        </span>
      </div>
      <div className="text-2xl font-bold tracking-tight" style={{ color: C.fg }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: C.mutedFg }}>{label}</div>
    </div>
  )
}

// ── Landing Page ──
function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div style={{ background: C.bg, color: C.fg }} className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.accent }}>
            <RiFlashlightLine size={20} color="#fff" />
          </div>
          <span className="text-xl font-bold tracking-tight">FitVerse</span>
        </div>
        <button
          onClick={onGetStarted}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90"
          style={{ background: C.accent, color: '#fff' }}
        >
          Get Started
        </button>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 md:px-12 py-20 md:py-32 text-center">
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 50% 0%, ${C.accent}, transparent 70%)` }} />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6" style={{ background: C.secondary, color: C.mutedFg, border: `1px solid ${C.border}` }}>
            <RiFlashlightLine size={14} style={{ color: C.accent }} />
            AI-Powered Health Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Transform Your Fitness
            <br />
            <span style={{ color: C.accent }}>Journey with AI</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: C.mutedFg }}>
            Track metrics, generate personalized diet plans, calculate BMI and calories, and chat with an AI fitness assistant -- all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 hover:scale-105"
              style={{ background: C.accent, color: '#fff', boxShadow: `0 0 30px ${C.accent}44` }}
            >
              Get Started
            </button>
            <a
              href="#features"
              className="px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 hover:opacity-80"
              style={{ background: C.secondary, color: C.fg, border: `1px solid ${C.border}` }}
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center tracking-tight mb-4">Powered by Intelligence</h2>
          <p className="text-center mb-12" style={{ color: C.mutedFg }}>Three AI agents working together for your health goals</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <RiLeafLine size={28} />, title: 'AI Diet Planning', desc: 'Get personalized weekly meal plans with detailed macro breakdowns tailored to your goals and preferences.' },
              { icon: <RiCalculatorLine size={28} />, title: 'Health Calculators', desc: 'Compute BMI, daily caloric needs, and receive AI-generated health insights and recommendations.' },
              { icon: <RiChat3Line size={28} />, title: 'AI Fitness Assistant', desc: 'Chat with an intelligent assistant about workouts, nutrition, injury prevention, and wellness.' },
            ].map((f, i) => (
              <div key={i} className="rounded-xl p-6 transition-all duration-200 hover:scale-[1.02]" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: C.secondary, color: C.accent }}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.mutedFg }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 md:px-12 py-20" style={{ background: C.card }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center tracking-tight mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah M.', text: 'The AI diet plans are incredibly detailed. I lost 12 pounds in 8 weeks following the personalized meal plans.', rating: 5 },
              { name: 'David K.', text: 'Having all my health metrics and AI tools in one place is a game-changer. The calculator insights helped me understand my body better.', rating: 5 },
              { name: 'Emily R.', text: 'The chatbot is like having a personal trainer in my pocket. Quick, accurate answers about any fitness topic.', rating: 5 },
            ].map((t, i) => (
              <div key={i} className="rounded-xl p-6" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => <RiStarFill key={j} size={16} style={{ color: '#f59e0b' }} />)}
                </div>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: C.mutedFg }}>&#34;{t.text}&#34;</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: C.accent, color: '#fff' }}>
                    {t.name[0]}
                  </div>
                  <span className="text-sm font-medium">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-12 text-center" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <RiFlashlightLine size={18} style={{ color: C.accent }} />
          <span className="font-bold tracking-tight">FitVerse</span>
        </div>
        <p className="text-xs" style={{ color: C.mutedFg }}>Your AI-powered health and fitness companion</p>
      </footer>
    </div>
  )
}

// ── Dashboard ──
function DashboardScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const maxWeight = Math.max(...WEIGHT_HISTORY.map(w => w.value))
  const minWeight = Math.min(...WEIGHT_HISTORY.map(w => w.value))

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={<RiScales2Line size={20} style={{ color: C.accent }} />} label="Current Weight" value="80.8 kg" trend="1.5 kg" trendUp={false} />
        <StatCard icon={<RiHeartPulseLine size={20} style={{ color: '#ec4899' }} />} label="BMI" value="24.2" trend="0.4" trendUp={false} />
        <StatCard icon={<RiFireLine size={20} style={{ color: '#f59e0b' }} />} label="Daily Calories" value="2,150" trend="5%" trendUp={true} />
        <StatCard icon={<RiTrophyLine size={20} style={{ color: '#22c55e' }} />} label="Goal Progress" value="68%" trend="12%" trendUp={true} />
      </div>

      {/* Weight Chart + CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Weight Progress */}
        <div className="lg:col-span-3 rounded-xl p-6" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
          <h3 className="text-base font-bold tracking-tight mb-4" style={{ color: C.fg }}>Weight Progress</h3>
          <div className="flex items-end gap-2 h-44">
            {WEIGHT_HISTORY.map((w, i) => {
              const pct = ((w.value - minWeight + 1) / (maxWeight - minWeight + 2)) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium" style={{ color: C.mutedFg }}>{w.value}</span>
                  <div
                    className="w-full rounded-t-lg transition-all duration-500"
                    style={{ height: `${pct}%`, background: `linear-gradient(to top, ${C.accent}, #9333ea)`, minHeight: '8px' }}
                  />
                  <span className="text-[10px]" style={{ color: C.mutedFg }}>{w.week}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Generate Diet Plan CTA */}
        <div className="lg:col-span-2 rounded-xl p-6 flex flex-col justify-between" style={{ background: `linear-gradient(135deg, ${C.accent}22, ${C.card})`, border: `1px solid ${C.accent}33`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
          <div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: C.accent + '33' }}>
              <RiLeafLine size={24} style={{ color: C.accent }} />
            </div>
            <h3 className="text-lg font-bold tracking-tight mb-2" style={{ color: C.fg }}>AI Diet Planning</h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: C.mutedFg }}>
              Get a personalized weekly meal plan powered by AI, tailored to your goals and preferences.
            </p>
          </div>
          <button
            onClick={() => onNavigate('dietplan')}
            className="w-full px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{ background: C.accent, color: '#fff', boxShadow: `0 0 20px ${C.accent}44` }}
          >
            Generate Diet Plan
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('dietplan')}
          className="rounded-xl p-5 text-left transition-all duration-200 hover:scale-[1.02]"
          style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: '#22c55e22' }}>
            <RiLeafLine size={20} style={{ color: '#4ade80' }} />
          </div>
          <div className="text-sm font-bold tracking-tight" style={{ color: C.fg }}>Diet Planning</div>
          <div className="text-xs mt-1" style={{ color: C.mutedFg }}>Generate AI meal plans</div>
        </button>
        <button
          onClick={() => onNavigate('aitools')}
          className="rounded-xl p-5 text-left transition-all duration-200 hover:scale-[1.02]"
          style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: '#3b82f622' }}>
            <RiCalculatorLine size={20} style={{ color: '#60a5fa' }} />
          </div>
          <div className="text-sm font-bold tracking-tight" style={{ color: C.fg }}>Health Calculator</div>
          <div className="text-xs mt-1" style={{ color: C.mutedFg }}>BMI & calorie analysis</div>
        </button>
        <button
          onClick={() => onNavigate('aitools')}
          className="rounded-xl p-5 text-left transition-all duration-200 hover:scale-[1.02]"
          style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: C.accent + '22' }}>
            <RiChat3Line size={20} style={{ color: C.accent }} />
          </div>
          <div className="text-sm font-bold tracking-tight" style={{ color: C.fg }}>AI Assistant</div>
          <div className="text-xs mt-1" style={{ color: C.mutedFg }}>Chat about fitness</div>
        </button>
      </div>
    </div>
  )
}

// ── Diet Plan Screen ──
function DietPlanScreen() {
  const [dietLoading, setDietLoading] = useState(false)
  const [dietPlan, setDietPlan] = useState<DietPlanResponse | null>(null)
  const [dietError, setDietError] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState(0)

  // Diet form
  const [goal, setGoal] = useState('Weight Loss')
  const [preference, setPreference] = useState('No Preference')
  const [restrictions, setRestrictions] = useState('')
  const [calorieTarget, setCalorieTarget] = useState('2000')
  const [mealsPerDay, setMealsPerDay] = useState('4')
  const [numberOfDays, setNumberOfDays] = useState('7')

  const inputStyle: React.CSSProperties = { background: C.input, color: C.fg, border: `1px solid ${C.border}` }

  const handleGenerate = async () => {
    setDietLoading(true)
    setDietError(null)
    try {
      const msg = `Generate a personalized weekly diet plan with the following requirements:
- Fitness Goal: ${goal}
- Dietary Preference: ${preference}
- Allergies/Restrictions: ${restrictions || 'None'}
- Daily Calorie Target: ${calorieTarget} calories
- Meals per day: ${mealsPerDay} (including snacks)
- Number of days: ${numberOfDays}
Please provide a complete ${numberOfDays}-day meal plan with breakfast, lunch, dinner, and snacks for each day, including macro information (protein, carbs, fats in grams) for every meal.`
      const result = await callAIAgent(msg, DIET_PLAN_AGENT_ID)
      const data = parseAgentResult(result)
      if (data) {
        setDietPlan(data as DietPlanResponse)
        setSelectedDay(0)
      } else {
        setDietError('Failed to generate diet plan. Please try again.')
      }
    } catch {
      setDietError('An error occurred. Please try again.')
    }
    setDietLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.accent}22, ${C.card})`, border: `1px solid ${C.accent}33`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
        <div className="absolute top-0 right-0 w-40 h-40 opacity-10" style={{ background: `radial-gradient(circle, ${C.accent}, transparent)` }} />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: C.accent + '33' }}>
            <RiLeafLine size={28} style={{ color: C.accent }} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-1" style={{ color: C.fg }}>AI Diet Plan Generator</h2>
            <p className="text-sm leading-relaxed" style={{ color: C.mutedFg }}>
              Get a personalized weekly meal plan with detailed macro breakdowns, tailored to your fitness goals, dietary preferences, and restrictions.
            </p>
          </div>
        </div>
      </div>

      {/* Form + Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-1 rounded-xl p-6 h-fit lg:sticky lg:top-24" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
          <h3 className="text-base font-bold tracking-tight mb-5 flex items-center gap-2" style={{ color: C.fg }}>
            <RiEditLine size={16} style={{ color: C.accent }} />
            Your Preferences
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: C.mutedFg }}>Fitness Goal</label>
              <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
                <option>Weight Loss</option><option>Weight Gain</option><option>Maintenance</option><option>Muscle Building</option><option>Athletic Performance</option><option>Body Recomposition</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: C.mutedFg }}>Dietary Preference</label>
              <select value={preference} onChange={e => setPreference(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
                <option>No Preference</option><option>Vegetarian</option><option>Vegan</option><option>Keto</option><option>Paleo</option><option>Mediterranean</option><option>Low Carb</option><option>High Protein</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: C.mutedFg }}>Allergies / Restrictions</label>
              <input type="text" value={restrictions} onChange={e => setRestrictions(e.target.value)} placeholder="e.g., nuts, gluten, dairy, shellfish" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: C.mutedFg }}>Daily Calories</label>
                <input type="number" value={calorieTarget} onChange={e => setCalorieTarget(e.target.value)} placeholder="2000" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: C.mutedFg }}>Meals / Day</label>
                <select value={mealsPerDay} onChange={e => setMealsPerDay(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
                  <option>3</option><option>4</option><option>5</option><option>6</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: C.mutedFg }}>Number of Days</label>
              <select value={numberOfDays} onChange={e => setNumberOfDays(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
                <option>3</option><option>5</option><option>7</option>
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={dietLoading}
              className="w-full px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: C.accent, color: '#fff', boxShadow: `0 0 20px ${C.accent}44` }}
            >
              {dietLoading && <RiLoader4Line size={16} className="animate-spin" />}
              {dietLoading ? 'Generating Plan...' : 'Generate Diet Plan'}
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Empty State */}
          {!dietPlan && !dietLoading && !dietError && (
            <div className="rounded-xl p-12 flex flex-col items-center justify-center text-center" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style={{ background: C.secondary }}>
                <RiLeafLine size={36} style={{ color: C.muted }} />
              </div>
              <h3 className="text-lg font-bold tracking-tight mb-2" style={{ color: C.fg }}>No Diet Plan Yet</h3>
              <p className="text-sm max-w-md leading-relaxed" style={{ color: C.mutedFg }}>
                Fill in your preferences on the left and click "Generate Diet Plan" to receive a personalized meal plan with detailed macro breakdowns for each meal.
              </p>
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((m, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-xs" style={{ background: C.secondary, color: C.mutedFg, border: `1px solid ${C.border}` }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {dietLoading && (
            <div className="rounded-xl p-8" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
              <div className="flex items-center gap-3 mb-6">
                <RiLoader4Line size={20} className="animate-spin" style={{ color: C.accent }} />
                <span className="text-sm font-medium" style={{ color: C.fg }}>Generating your personalized diet plan...</span>
              </div>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl p-4" style={{ background: C.secondary }}>
                    <SkeletonBlock />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {dietError && (
            <div className="rounded-xl p-5 flex items-start gap-3" style={{ background: '#7f1d1d22', border: '1px solid #7f1d1d44' }}>
              <RiAlertLine size={20} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-red-300 mb-1">Generation Failed</div>
                <div className="text-xs text-red-400">{dietError}</div>
                <button onClick={handleGenerate} className="text-xs font-medium mt-2 px-3 py-1.5 rounded-lg transition-all hover:opacity-80" style={{ background: C.secondary, color: C.accent }}>
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Diet Plan Results */}
          {dietPlan && !dietLoading && (
            <>
              {/* Plan Header */}
              <div className="rounded-xl p-6" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight" style={{ color: C.fg }}>{dietPlan.plan_title || 'Your Personalized Diet Plan'}</h3>
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: C.mutedFg }}>{dietPlan.overview}</p>
                  </div>
                  <span className="text-xs px-3 py-1.5 rounded-full font-semibold shrink-0 ml-4" style={{ background: C.accent + '22', color: C.accent }}>
                    {dietPlan.daily_calories_target} cal/day
                  </span>
                </div>
              </div>

              {/* Day Tabs */}
              {Array.isArray(dietPlan.weekly_plan) && dietPlan.weekly_plan.length > 0 && (
                <>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {dietPlan.weekly_plan.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedDay(i)}
                        className="px-5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200"
                        style={{
                          background: selectedDay === i ? C.accent : C.card,
                          color: selectedDay === i ? '#fff' : C.mutedFg,
                          border: `1px solid ${selectedDay === i ? C.accent : C.border}`,
                          boxShadow: selectedDay === i ? `0 0 15px ${C.accent}33` : 'none',
                        }}
                      >
                        {d.day}
                      </button>
                    ))}
                  </div>

                  {/* Daily Total Summary Bar */}
                  {dietPlan.weekly_plan[selectedDay]?.daily_total && (
                    <div className="rounded-xl p-4 flex flex-wrap items-center gap-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                      <span className="text-xs font-bold" style={{ color: C.fg }}>
                        {dietPlan.weekly_plan[selectedDay].day} Summary
                      </span>
                      <div className="flex items-center gap-1.5">
                        <RiFireLine size={14} style={{ color: '#f59e0b' }} />
                        <span className="text-xs font-medium" style={{ color: C.fg }}>{dietPlan.weekly_plan[selectedDay].daily_total.calories} cal</span>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: '#22c55e22', color: '#4ade80' }}>
                        Protein: {dietPlan.weekly_plan[selectedDay].daily_total.protein_g}g
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: '#3b82f622', color: '#60a5fa' }}>
                        Carbs: {dietPlan.weekly_plan[selectedDay].daily_total.carbs_g}g
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: '#f59e0b22', color: '#fbbf24' }}>
                        Fats: {dietPlan.weekly_plan[selectedDay].daily_total.fats_g}g
                      </span>
                    </div>
                  )}

                  {/* Meals Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.isArray(dietPlan.weekly_plan[selectedDay]?.meals) && dietPlan.weekly_plan[selectedDay].meals.map((meal, mi) => (
                      <div key={mi} className="rounded-xl p-5 transition-all duration-200 hover:scale-[1.01]" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg" style={{ background: C.accent + '22', color: C.accent }}>{meal.meal_type}</span>
                          <span className="text-xs font-semibold flex items-center gap-1" style={{ color: C.fg }}>
                            <RiFireLine size={12} style={{ color: '#f59e0b' }} />
                            {meal.calories} cal
                          </span>
                        </div>
                        <h4 className="text-sm font-bold mb-3" style={{ color: C.fg }}>{meal.meal_name}</h4>

                        {/* Macro pills */}
                        <div className="flex gap-2 mb-3">
                          <span className="text-[10px] px-2.5 py-1 rounded-lg font-medium" style={{ background: '#22c55e15', color: '#4ade80' }}>P: {meal.protein_g}g</span>
                          <span className="text-[10px] px-2.5 py-1 rounded-lg font-medium" style={{ background: '#3b82f615', color: '#60a5fa' }}>C: {meal.carbs_g}g</span>
                          <span className="text-[10px] px-2.5 py-1 rounded-lg font-medium" style={{ background: '#f59e0b15', color: '#fbbf24' }}>F: {meal.fats_g}g</span>
                        </div>

                        {/* Ingredients */}
                        {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 && (
                          <div className="pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: C.mutedFg }}>Ingredients</div>
                            <div className="flex flex-wrap gap-1.5">
                              {meal.ingredients.map((ing, ii) => (
                                <span key={ii} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: C.secondary, color: C.mutedFg }}>
                                  {ing}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Tips */}
              {Array.isArray(dietPlan.tips) && dietPlan.tips.length > 0 && (
                <div className="rounded-xl p-6" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
                  <h4 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: C.fg }}>
                    <RiLightbulbLine size={16} style={{ color: '#f59e0b' }} />
                    Nutrition Tips & Recommendations
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {dietPlan.tips.map((tip, i) => (
                      <div key={i} className="rounded-xl p-3 text-xs leading-relaxed flex items-start gap-2" style={{ background: C.secondary, color: C.mutedFg }}>
                        <RiCheckLine size={14} className="shrink-0 mt-0.5" style={{ color: '#4ade80' }} />
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regenerate */}
              <div className="flex justify-center">
                <button
                  onClick={handleGenerate}
                  disabled={dietLoading}
                  className="px-6 py-2.5 rounded-xl text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ background: C.secondary, color: C.mutedFg, border: `1px solid ${C.border}` }}
                >
                  Regenerate Plan
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── AI Tools ──
function AIToolsScreen() {
  // Health Calculator
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('Male')
  const [activity, setActivity] = useState('Moderately Active')
  const [calcLoading, setCalcLoading] = useState(false)
  const [calcResult, setCalcResult] = useState<HealthCalcResponse | null>(null)
  const [calcError, setCalcError] = useState<string | null>(null)

  // Chatbot
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleCalculate = async () => {
    if (!height || !weight || !age) {
      setCalcError('Please fill in all fields.')
      return
    }
    setCalcLoading(true)
    setCalcError(null)
    try {
      const msg = `Calculate health metrics for: Height: ${height}cm, Weight: ${weight}kg, Age: ${age}, Gender: ${gender}, Activity Level: ${activity}. Please compute BMI with category, BMR, TDEE, and provide calorie recommendations for different goals along with personalized health insights.`
      const result = await callAIAgent(msg, HEALTH_CALCULATOR_AGENT_ID)
      const data = parseAgentResult(result)
      if (data) {
        setCalcResult(data as HealthCalcResponse)
      } else {
        setCalcError('Failed to calculate. Please try again.')
      }
    } catch {
      setCalcError('An error occurred. Please try again.')
    }
    setCalcLoading(false)
  }

  const handleChat = async () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setChatLoading(true)
    try {
      const result = await callAIAgent(userMsg, AI_CHATBOT_AGENT_ID)
      const data = parseAgentResult(result)
      if (data) {
        const chatData = data as { response?: string; suggestions?: string[]; disclaimer?: string }
        setChatMessages(prev => [...prev, {
          role: 'bot',
          text: chatData.response || 'I couldn\'t generate a response.',
          suggestions: Array.isArray(chatData.suggestions) ? chatData.suggestions : [],
          disclaimer: chatData.disclaimer || '',
        }])
      } else {
        setChatMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I couldn\'t process your request. Please try again.' }])
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'bot', text: 'An error occurred. Please try again.' }])
    }
    setChatLoading(false)
  }

  const inputStyle: React.CSSProperties = { background: C.input, color: C.fg, border: `1px solid ${C.border}` }

  return (
    <div className="space-y-6">
      {/* Calculators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="rounded-xl p-6" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.accent + '22' }}>
              <RiCalculatorLine size={20} style={{ color: C.accent }} />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight" style={{ color: C.fg }}>Health Calculator</h3>
              <p className="text-xs" style={{ color: C.mutedFg }}>BMI, Calories & Health Insights</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: C.mutedFg }}>Height (cm)</label>
                <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: C.mutedFg }}>Weight (kg)</label>
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="75" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: C.mutedFg }}>Age</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="30" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: C.mutedFg }}>Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
                  <option>Male</option><option>Female</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: C.mutedFg }}>Activity Level</label>
              <select value={activity} onChange={e => setActivity(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
                <option>Sedentary</option><option>Lightly Active</option><option>Moderately Active</option><option>Very Active</option><option>Extra Active</option>
              </select>
            </div>
            {calcError && (
              <div className="text-xs flex items-center gap-2 text-red-400">
                <RiAlertLine size={14} />{calcError}
              </div>
            )}
            <button
              onClick={handleCalculate}
              disabled={calcLoading}
              className="w-full px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: C.accent, color: '#fff' }}
            >
              {calcLoading && <RiLoader4Line size={16} className="animate-spin" />}
              {calcLoading ? 'Calculating...' : 'Calculate'}
            </button>
          </div>
        </div>

        {/* Results Card */}
        <div className="rounded-xl p-6" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
          <h3 className="text-base font-bold tracking-tight mb-4" style={{ color: C.fg }}>Results</h3>
          {calcLoading && <SkeletonBlock />}
          {!calcLoading && !calcResult && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <RiHeartPulseLine size={40} style={{ color: C.muted }} />
              <p className="text-sm mt-3" style={{ color: C.mutedFg }}>Enter your details and click Calculate to see your health metrics</p>
            </div>
          )}
          {calcResult && !calcLoading && (
            <div className="space-y-4">
              {/* BMI */}
              <div className="rounded-xl p-4" style={{ background: C.secondary }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: C.mutedFg }}>BMI</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                    background: calcResult.bmi.category?.toLowerCase().includes('normal') ? '#22c55e22' : '#f59e0b22',
                    color: calcResult.bmi.category?.toLowerCase().includes('normal') ? '#4ade80' : '#fbbf24',
                  }}>
                    {calcResult.bmi.category}
                  </span>
                </div>
                <div className="text-3xl font-bold" style={{ color: C.fg }}>{calcResult.bmi.value?.toFixed(1)}</div>
                <div className="text-xs mt-1" style={{ color: C.mutedFg }}>Healthy range: {calcResult.bmi.healthy_range}</div>
              </div>

              {/* Calories */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3 text-center" style={{ background: C.secondary }}>
                  <div className="text-xs" style={{ color: C.mutedFg }}>BMR</div>
                  <div className="text-lg font-bold" style={{ color: C.fg }}>{Math.round(calcResult.bmr || 0)}</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: C.secondary }}>
                  <div className="text-xs" style={{ color: C.mutedFg }}>TDEE</div>
                  <div className="text-lg font-bold" style={{ color: C.fg }}>{Math.round(calcResult.tdee || 0)}</div>
                </div>
              </div>

              {/* Calorie Recs */}
              {calcResult.calorie_recommendations && (
                <div className="rounded-xl p-4" style={{ background: C.secondary }}>
                  <div className="text-xs font-semibold mb-3" style={{ color: C.fg }}>Calorie Recommendations</div>
                  <div className="space-y-2">
                    {Object.entries(calcResult.calorie_recommendations).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs capitalize" style={{ color: C.mutedFg }}>{key.replace(/_/g, ' ')}</span>
                        <span className="text-xs font-medium" style={{ color: C.fg }}>{Math.round(val as number)} cal</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              {Array.isArray(calcResult.insights) && calcResult.insights.length > 0 && (
                <div>
                  <div className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: C.fg }}>
                    <RiLightbulbLine size={14} style={{ color: '#f59e0b' }} /> Insights
                  </div>
                  {calcResult.insights.map((ins, i) => (
                    <div key={i} className="text-xs leading-relaxed mb-1 pl-3" style={{ color: C.mutedFg, borderLeft: `2px solid ${C.accent}44` }}>{ins}</div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {Array.isArray(calcResult.recommendations) && calcResult.recommendations.length > 0 && (
                <div>
                  <div className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: C.fg }}>
                    <RiCheckLine size={14} style={{ color: '#22c55e' }} /> Recommendations
                  </div>
                  {calcResult.recommendations.map((rec, i) => (
                    <div key={i} className="text-xs leading-relaxed mb-1 pl-3" style={{ color: C.mutedFg, borderLeft: `2px solid #22c55e44` }}>{rec}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chatbot */}
      <div className="rounded-xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
        <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.accent + '22' }}>
            <RiChat3Line size={20} style={{ color: C.accent }} />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight" style={{ color: C.fg }}>AI Fitness Assistant</h3>
            <p className="text-xs" style={{ color: C.mutedFg }}>Ask anything about workouts, nutrition, and wellness</p>
          </div>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto px-6 py-4 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: `${C.muted} transparent` }}>
          {chatMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <RiRobot2Line size={36} style={{ color: C.muted }} />
              <p className="text-sm mt-3" style={{ color: C.mutedFg }}>Start a conversation with your AI fitness assistant</p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {['What should I eat post-workout?', 'How do I build muscle?', 'Tips for better sleep'].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setChatInput(q) }}
                    className="px-3 py-1.5 rounded-full text-xs transition-all hover:opacity-80"
                    style={{ background: C.secondary, color: C.mutedFg, border: `1px solid ${C.border}` }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%]">
                <div
                  className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={{
                    background: msg.role === 'user' ? C.accent : C.secondary,
                    color: msg.role === 'user' ? '#fff' : C.fg,
                    borderBottomRightRadius: msg.role === 'user' ? '4px' : undefined,
                    borderBottomLeftRadius: msg.role === 'bot' ? '4px' : undefined,
                  }}
                >
                  {msg.text}
                </div>
                {msg.role === 'bot' && Array.isArray(msg.suggestions) && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.suggestions.map((s, si) => (
                      <button
                        key={si}
                        onClick={() => setChatInput(s)}
                        className="px-2.5 py-1 rounded-full text-[10px] transition-all hover:opacity-80"
                        style={{ background: C.muted, color: C.mutedFg, border: `1px solid ${C.border}` }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                {msg.role === 'bot' && msg.disclaimer && (
                  <div className="flex items-start gap-1.5 mt-2">
                    <RiInformationLine size={12} className="shrink-0 mt-0.5" style={{ color: C.mutedFg }} />
                    <span className="text-[10px]" style={{ color: C.mutedFg }}>{msg.disclaimer}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-5 py-3 flex gap-1.5" style={{ background: C.secondary }}>
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: C.mutedFg, animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: C.mutedFg, animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: C.mutedFg, animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 flex gap-3" style={{ borderTop: `1px solid ${C.border}` }}>
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !chatLoading && handleChat()}
            placeholder="Ask about workouts, nutrition, or wellness..."
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: C.input, color: C.fg, border: `1px solid ${C.border}` }}
          />
          <button
            onClick={handleChat}
            disabled={chatLoading || !chatInput.trim()}
            className="px-4 py-2.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: C.accent, color: '#fff' }}
          >
            <RiSendPlaneLine size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Blog ──
function BlogScreen() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)

  const categories = ['All', ...Array.from(new Set(BLOG_POSTS.map(p => p.category)))]
  const filtered = BLOG_POSTS.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || p.category === category
    return matchSearch && matchCat
  })

  if (selectedPost) {
    return (
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setSelectedPost(null)} className="flex items-center gap-2 mb-6 text-sm font-medium transition-all hover:opacity-80" style={{ color: C.accent }}>
          <RiArrowLeftLine size={18} /> Back to articles
        </button>
        <div className="rounded-xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
          <div className="h-48 w-full" style={{ background: `linear-gradient(135deg, ${selectedPost.color}, ${selectedPost.color}88)` }} />
          <div className="p-8">
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: C.accent + '22', color: C.accent }}>{selectedPost.category}</span>
            <h1 className="text-2xl font-bold tracking-tight mt-4 mb-2" style={{ color: C.fg }}>{selectedPost.title}</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: C.accent, color: '#fff' }}>{selectedPost.author[0]}</div>
                <span className="text-xs" style={{ color: C.mutedFg }}>{selectedPost.author}</span>
              </div>
              <span className="text-xs flex items-center gap-1" style={{ color: C.mutedFg }}><RiTimeLine size={12} />{selectedPost.date}</span>
              <span className="text-xs flex items-center gap-1" style={{ color: C.mutedFg }}><RiBookOpenLine size={12} />{selectedPost.readTime}</span>
            </div>
            <div className="prose prose-invert max-w-none">
              {selectedPost.body.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm leading-relaxed mb-4" style={{ color: C.mutedFg }}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <RiSearchLine size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: C.mutedFg }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: C.input, color: C.fg, border: `1px solid ${C.border}` }}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
              style={{ background: category === cat ? C.accent : C.secondary, color: category === cat ? '#fff' : C.mutedFg }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(post => (
          <button
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="rounded-xl overflow-hidden text-left transition-all duration-200 hover:scale-[1.02]"
            style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}
          >
            <div className="h-32 w-full" style={{ background: `linear-gradient(135deg, ${post.color}, ${post.color}88)` }} />
            <div className="p-5">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: C.accent + '22', color: C.accent }}>{post.category}</span>
              <h3 className="text-sm font-bold tracking-tight mt-2 mb-2 line-clamp-2" style={{ color: C.fg }}>{post.title}</h3>
              <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: C.mutedFg }}>{post.excerpt}</p>
              <div className="flex items-center gap-3">
                <span className="text-[10px]" style={{ color: C.mutedFg }}>{post.date}</span>
                <span className="text-[10px] flex items-center gap-1" style={{ color: C.mutedFg }}><RiTimeLine size={10} />{post.readTime}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <RiSearchLine size={32} style={{ color: C.muted }} className="mx-auto" />
          <p className="text-sm mt-3" style={{ color: C.mutedFg }}>No articles found matching your search</p>
        </div>
      )}
    </div>
  )
}

// ── Profile ──
function ProfileScreen() {
  const [profile, setProfile] = useState({
    name: 'FitVerse User',
    email: 'user@fitverse.com',
    bio: '',
    fitnessGoal: 'Weight Loss',
    activityLevel: 'Moderately Active',
  })
  const [passwords, setPasswords] = useState({ old: '', new_: '', confirm: '' })
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('fitverse_profile')
    if (stored) {
      try { setProfile(JSON.parse(stored)) } catch { /* ignore */ }
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('fitverse_profile', JSON.stringify(profile))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputStyle: React.CSSProperties = { background: C.input, color: C.fg, border: `1px solid ${C.border}` }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-xl p-6" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold mb-3" style={{ background: `linear-gradient(135deg, ${C.accent}, #9333ea)`, color: '#fff' }}>
              {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm font-medium" style={{ color: C.fg }}>{profile.name}</span>
            <span className="text-xs" style={{ color: C.mutedFg }}>{profile.email}</span>
          </div>
          {/* Fields */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: C.mutedFg }}>Full Name</label>
              <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: C.mutedFg }}>Email</label>
              <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: C.mutedFg }}>Bio</label>
              <textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} rows={3} placeholder="Tell us about your fitness journey..." className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none" style={inputStyle} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: C.mutedFg }}>Fitness Goal</label>
                <select value={profile.fitnessGoal} onChange={e => setProfile({ ...profile, fitnessGoal: e.target.value })} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
                  <option>Weight Loss</option><option>Weight Gain</option><option>Maintenance</option><option>Muscle Building</option><option>Endurance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: C.mutedFg }}>Activity Level</label>
                <select value={profile.activityLevel} onChange={e => setProfile({ ...profile, activityLevel: e.target.value })} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
                  <option>Sedentary</option><option>Lightly Active</option><option>Moderately Active</option><option>Very Active</option><option>Extra Active</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-xl p-6" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
        <h3 className="text-base font-bold tracking-tight mb-4" style={{ color: C.fg }}>Change Password</h3>
        <div className="space-y-3">
          <div className="relative">
            <label className="block text-xs font-medium mb-1" style={{ color: C.mutedFg }}>Current Password</label>
            <input type={showOld ? 'text' : 'password'} value={passwords.old} onChange={e => setPasswords({ ...passwords, old: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none pr-10" style={inputStyle} />
            <button className="absolute right-3 top-7" onClick={() => setShowOld(!showOld)} style={{ color: C.mutedFg }}>
              {showOld ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
            </button>
          </div>
          <div className="relative">
            <label className="block text-xs font-medium mb-1" style={{ color: C.mutedFg }}>New Password</label>
            <input type={showNew ? 'text' : 'password'} value={passwords.new_} onChange={e => setPasswords({ ...passwords, new_: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none pr-10" style={inputStyle} />
            <button className="absolute right-3 top-7" onClick={() => setShowNew(!showNew)} style={{ color: C.mutedFg }}>
              {showNew ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: C.mutedFg }}>Confirm New Password</label>
            <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between">
        {saved && (
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#4ade80' }}>
            <RiCheckLine size={16} /> Profile saved successfully
          </div>
        )}
        <div className="flex-1" />
        <button
          onClick={handleSave}
          className="px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90"
          style={{ background: C.accent, color: '#fff' }}
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

// ── Admin ──
function AdminScreen() {
  const [tab, setTab] = useState<'users' | 'blog' | 'analytics'>('users')
  const [userSearch, setUserSearch] = useState('')

  const filteredUsers = MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const analyticsData = [
    { label: 'Jan', signups: 45, active: 120 },
    { label: 'Feb', signups: 52, active: 135 },
    { label: 'Mar', signups: 67, active: 158 },
    { label: 'Apr', signups: 58, active: 162 },
    { label: 'May', signups: 73, active: 180 },
    { label: 'Jun', signups: 81, active: 195 },
  ]
  const maxSignups = Math.max(...analyticsData.map(d => d.signups))
  const maxActive = Math.max(...analyticsData.map(d => d.active))

  return (
    <div className="space-y-6">
      {/* Admin Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full w-fit text-xs font-medium" style={{ background: C.accent + '22', color: C.accent, border: `1px solid ${C.accent}44` }}>
        <RiShieldUserLine size={14} /> Admin Panel
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['users', 'blog', 'analytics'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all"
            style={{ background: tab === t ? C.accent : C.secondary, color: tab === t ? '#fff' : C.mutedFg }}
          >
            {t === 'blog' ? 'Blog Posts' : t}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="rounded-xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
          <div className="p-4" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="relative max-w-xs">
              <RiSearchLine size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.mutedFg }} />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none"
                style={{ background: C.input, color: C.fg, border: `1px solid ${C.border}` }}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: C.mutedFg }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: C.accent, color: '#fff' }}>{u.name[0]}</div>
                        <span className="text-xs font-medium" style={{ color: C.fg }}>{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: C.mutedFg }}>{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{
                        background: u.role === 'Admin' ? C.accent + '22' : C.secondary,
                        color: u.role === 'Admin' ? C.accent : C.mutedFg,
                      }}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{
                        background: u.status === 'Active' ? '#22c55e22' : '#ef444422',
                        color: u.status === 'Active' ? '#4ade80' : '#f87171',
                      }}>{u.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: C.mutedFg }}>{u.joined}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="p-1.5 rounded-lg transition-all hover:opacity-70" style={{ background: C.secondary, color: C.mutedFg }}><RiEditLine size={14} /></button>
                        <button className="p-1.5 rounded-lg transition-all hover:opacity-70" style={{ background: '#ef444422', color: '#f87171' }}><RiDeleteBinLine size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Blog Tab */}
      {tab === 'blog' && (
        <div className="rounded-xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {['Title', 'Author', 'Category', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: C.mutedFg }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BLOG_POSTS.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td className="px-4 py-3 text-xs font-medium max-w-[200px] truncate" style={{ color: C.fg }}>{p.title}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: C.mutedFg }}>{p.author}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: C.accent + '22', color: C.accent }}>{p.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{
                        background: i % 3 === 0 ? '#f59e0b22' : '#22c55e22',
                        color: i % 3 === 0 ? '#fbbf24' : '#4ade80',
                      }}>{i % 3 === 0 ? 'Draft' : 'Published'}</span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: C.mutedFg }}>{p.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="p-1.5 rounded-lg transition-all hover:opacity-70" style={{ background: C.secondary, color: C.mutedFg }}><RiEditLine size={14} /></button>
                        <button className="p-1.5 rounded-lg transition-all hover:opacity-70" style={{ background: '#ef444422', color: '#f87171' }}><RiDeleteBinLine size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {tab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Signups Chart */}
          <div className="rounded-xl p-6" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
            <h3 className="text-sm font-bold tracking-tight mb-4" style={{ color: C.fg }}>New Signups</h3>
            <div className="flex items-end gap-3 h-40">
              {analyticsData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium" style={{ color: C.mutedFg }}>{d.signups}</span>
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{ height: `${(d.signups / maxSignups) * 100}%`, background: `linear-gradient(to top, ${C.accent}, #9333ea)`, minHeight: '8px' }}
                  />
                  <span className="text-[10px]" style={{ color: C.mutedFg }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Users Chart */}
          <div className="rounded-xl p-6" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
            <h3 className="text-sm font-bold tracking-tight mb-4" style={{ color: C.fg }}>Active Users</h3>
            <div className="flex items-end gap-3 h-40">
              {analyticsData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium" style={{ color: C.mutedFg }}>{d.active}</span>
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{ height: `${(d.active / maxActive) * 100}%`, background: 'linear-gradient(to top, #22c55e, #4ade80)', minHeight: '8px' }}
                  />
                  <span className="text-[10px]" style={{ color: C.mutedFg }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: '1,247', icon: <RiUserLine size={18} /> },
              { label: 'Active Today', value: '195', icon: <RiRunLine size={18} /> },
              { label: 'Blog Posts', value: '38', icon: <RiArticleLine size={18} /> },
              { label: 'Diet Plans Generated', value: '892', icon: <RiLeafLine size={18} /> },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-4 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: C.secondary, color: C.accent }}>
                  {s.icon}
                </div>
                <div className="text-xl font-bold" style={{ color: C.fg }}>{s.value}</div>
                <div className="text-xs mt-1" style={{ color: C.mutedFg }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════
export default function Page() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const showSidebar = screen !== 'landing'

  const renderScreen = () => {
    switch (screen) {
      case 'landing': return <LandingPage onGetStarted={() => setScreen('dashboard')} />
      case 'dashboard': return <DashboardScreen onNavigate={setScreen} />
      case 'dietplan': return <DietPlanScreen />
      case 'aitools': return <AIToolsScreen />
      case 'blog': return <BlogScreen />
      case 'profile': return <ProfileScreen />
      case 'admin': return <AdminScreen />
      default: return null
    }
  }

  if (!showSidebar) {
    return renderScreen()
  }

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.fg }}>
      <Sidebar screen={screen} setScreen={setScreen} open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <TopHeader setOpen={setSidebarOpen} screen={screen} />
        <main className="flex-1 p-6">
          {renderScreen()}
        </main>
      </div>
    </div>
  )
}
