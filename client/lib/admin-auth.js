import crypto from 'crypto'
import nodemailer from 'nodemailer'

const OTP_TTL_MS = 60_000
const otpStore = new Map()

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || 'ewige-admin',
    password: process.env.ADMIN_PASSWORD || 'VitalitaetAdmin!2026',
    email: process.env.ADMIN_EMAIL || 'post@ewige-vitalitaet.de',
    hash: process.env.NEXT_PUBLIC_ADMIN_HASH || process.env.ADMIN_HASH || 'ewige-vitalitaet-admin-9f4d',
  }
}

export function generateOtpCode(length = 265) {
  const random = crypto.randomBytes(200).toString('base64url').replace(/[-_]/g, '')
  return random.slice(0, length).padEnd(length, '0')
}

export function setOtp(username, code) {
  otpStore.set(username, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
    createdAt: Date.now(),
  })
}

export function verifyOtp(username, submittedCode) {
  const record = otpStore.get(username)
  if (!record) return false
  if (Date.now() > record.expiresAt) {
    otpStore.delete(username)
    return false
  }
  const isValid = String(submittedCode).trim() === String(record.code).trim()
  if (isValid) otpStore.delete(username)
  return isValid
}

export async function sendOtpEmail({ to, code, username, expiresInSeconds = 60 }) {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    console.log(`[admin-otp] ${username} code for ${to}: ${code}`)
    return { ok: true, fallback: true, email: to, expiresInSeconds }
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  await transporter.sendMail({
    from: user,
    to,
    subject: 'Admin login code',
    text: `Your admin code: ${code}\nThis code is valid for ${expiresInSeconds} seconds.`,
  })

  return { ok: true, fallback: false, email: to, expiresInSeconds }
}
