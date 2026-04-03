import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM_EMAIL = 'IBF <noreply@ibf.app>'

export async function sendWelcomeEmail(to: string, name: string, role: 'founder' | 'student') {
  const dashboardUrl = role === 'founder' ? 'https://ibf.app/founder/dashboard' : 'https://ibf.app/student/dashboard'
  if (!resend) return console.warn('RESEND_API_KEY not set')
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Welcome to IBF, ${name}! 🚀`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0f; color: #fff;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="background: linear-gradient(135deg, #7c3aed, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; margin: 0;">IBF</h1>
          <p style="color: #9ca3af; margin: 4px 0 0;">Innovators Bridge Foundry</p>
        </div>
        <h2 style="color: #fff; font-size: 24px;">Welcome, ${name}! 🎉</h2>
        <p style="color: #9ca3af; line-height: 1.6;">You've joined IBF as a <strong style="color: #7c3aed;">${role}</strong>. We're excited to have you in the community.</p>
        ${role === 'founder' 
          ? `<p style="color: #9ca3af; line-height: 1.6;">Start by posting your first project and find the talented people who will help you build it.</p>`
          : `<p style="color: #9ca3af; line-height: 1.6;">Browse live projects from real founders and apply to join teams working on exciting ideas.</p>`
        }
        <div style="text-align: center; margin: 32px 0;">
          <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Go to Your Dashboard →</a>
        </div>
        <p style="color: #6b7280; font-size: 14px; text-align: center;">IBF · Connecting Founders, Students & Innovators</p>
      </div>
    `,
  })
}

export async function sendNewApplicationEmail(
  to: string,
  founderName: string,
  studentName: string,
  roleName: string,
  projectName: string,
  coverNote: string,
  applicationsUrl: string
) {
  if (!resend) return console.warn('RESEND_API_KEY not set')
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `New application for ${roleName} on ${projectName}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0f; color: #fff;">
        <h1 style="color: #7c3aed; font-size: 20px;">New Application Received 📬</h1>
        <p style="color: #9ca3af;">Hi ${founderName},</p>
        <p style="color: #9ca3af; line-height: 1.6;"><strong style="color: #fff;">${studentName}</strong> applied for the <strong style="color: #7c3aed;">${roleName}</strong> role on your project <strong style="color: #fff;">${projectName}</strong>.</p>
        ${coverNote ? `
        <div style="background: #1a1a2e; border-left: 3px solid #7c3aed; padding: 16px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #c4b5fd; font-size: 14px; margin: 0; font-style: italic;">"${coverNote}"</p>
        </div>
        ` : ''}
        <div style="text-align: center; margin: 32px 0;">
          <a href="${applicationsUrl}" style="background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Review Application →</a>
        </div>
      </div>
    `,
  })
}

export async function sendApplicationStatusEmail(
  to: string,
  studentName: string,
  projectName: string,
  roleName: string,
  status: 'accepted' | 'rejected'
) {
  const isAccepted = status === 'accepted'
  if (!resend) return console.warn('RESEND_API_KEY not set')
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: isAccepted ? `🎉 You've been accepted to ${projectName}!` : `Update on your application to ${projectName}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0f; color: #fff;">
        <h1 style="color: ${isAccepted ? '#10b981' : '#6b7280'}; font-size: 20px;">
          ${isAccepted ? '🎉 Application Accepted!' : 'Application Update'}
        </h1>
        <p style="color: #9ca3af;">Hi ${studentName},</p>
        ${isAccepted 
          ? `<p style="color: #9ca3af; line-height: 1.6;">Congratulations! You've been <strong style="color: #10b981;">accepted</strong> as <strong style="color: #fff;">${roleName}</strong> on <strong style="color: #7c3aed;">${projectName}</strong>. Head to your dashboard to access your team workspace.</p>`
          : `<p style="color: #9ca3af; line-height: 1.6;">Thank you for applying for <strong style="color: #fff;">${roleName}</strong> on <strong style="color: #fff;">${projectName}</strong>. Unfortunately, the founder has decided to move forward with other candidates. Keep exploring — there are many great projects waiting!</p>`
        }
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://ibf.app/student/dashboard" style="background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View Dashboard →</a>
        </div>
      </div>
    `,
  })
}
