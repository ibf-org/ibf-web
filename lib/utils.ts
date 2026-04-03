import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function timeAgo(date: string | Date) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ]
  for (const { label, seconds: s } of intervals) {
    const count = Math.floor(seconds / s)
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

export function generateUsername(name: string) {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + Math.random().toString(36).slice(2, 6)
}

export const SKILLS_LIST = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'Python', 'Node.js',
  'Django', 'FastAPI', 'Go', 'Rust', 'Java', 'Spring Boot', 'Ruby on Rails', 'PHP', 'Laravel',
  'iOS (Swift)', 'Android (Kotlin)', 'Flutter', 'React Native', 'PostgreSQL', 'MySQL', 'MongoDB',
  'Redis', 'Supabase', 'Firebase', 'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'DevOps',
  'CI/CD', 'UI/UX Design', 'Figma', 'Graphic Design', 'Motion Graphics', 'Brand Design',
  'Product Management', 'Growth Hacking', 'Digital Marketing', 'SEO', 'Content Marketing',
  'Social Media', 'Sales', 'Business Development', 'Finance & Accounting', 'Legal', 'Operations',
  'Data Science', 'Machine Learning', 'AI/LLMs', 'Computer Vision', 'NLP', 'Data Analytics',
  'Blockchain', 'Web3', 'Smart Contracts', 'Copywriting', 'Video Editing',
]

export const CATEGORIES = [
  'Fintech', 'Edtech', 'Healthtech', 'SaaS', 'Marketplace', 'Social', 'Other',
]

export const STAGES = ['Idea', 'MVP', 'Early Traction', 'Growth']

export const COMMITMENT_TYPES = [
  'Part-time (< 10 hrs/week)',
  'Part-time (10–20 hrs/week)',
  'Full-time',
]

export const COMPENSATION_TYPES = [
  'Equity',
  'Unpaid Learning',
  'Stipend Possible',
]

export const AVAILABILITY_OPTIONS = [
  { value: 'actively_looking', label: 'Actively Looking', emoji: '🟢' },
  { value: 'open', label: 'Open to Opportunities', emoji: '🟡' },
  { value: 'not_available', label: 'Not Available', emoji: '🔴' },
]

export const GRAD_YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i - 3)
