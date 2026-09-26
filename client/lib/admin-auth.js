import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import nodemailer from 'nodemailer'

const OTP_TTL_MS = 60_000
const otpStore = new Map()

function normalizeUsername(value = '') {
  return String(value).replace(/^@/, '').trim().toLowerCase()
}

function readTelegramRegistry() {
  const statePath = process.env.TELEGRAM_STATE_PATH || path.join(process.cwd(), '.telegram_state.json')
  try {
    const raw = fs.readFileSync(statePath, 'utf8')
    const parsed = JSON.parse(raw || '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (error) {
    return {}
  }
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || 'ewige-admin',
    password: process.env.ADMIN_PASSWORD || 'VitalitaetAdmin!2026',
    email: process.env.ADMIN_EMAIL || 'post@ewige-vitalitaet.de',
    hash: process.env.NEXT_PUBLIC_ADMIN_HASH || process.env.ADMIN_HASH || 'ewige-vitalitaet-admin-9f4d',
  }
}

export function getTelegramConfig() {
  const username = String(process.env.TELEGRAM_USERNAME || '8810581671').trim()
  const normalizedUsername = normalizeUsername(username)
  const registry = readTelegramRegistry()
  const registryChatId = normalizedUsername ? registry[normalizedUsername] || registry[username] || registry[`@${normalizedUsername}`] : ''

  const fixedChatId = String(process.env.TELEGRAM_CHAT_ID || registryChatId || '8810581671').trim()
  const fallbackUserChatId = String(process.env.TELEGRAM_USER_ID || '8810581671').trim()

  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '8960675503:AAHVlr-uWCcV8d7XudzMf5CwhWvF0jpa6eY',
    chatId: fixedChatId || fallbackUserChatId,
    username: username ? username.replace(/^@/, '') : '',
    usernameHandle: username ? (username.startsWith('@') ? username : `@${username}`) : '',
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

export async function sendOtpTelegram({ code, username, expiresInSeconds = 60 }) {
  const { botToken, chatId, username: telegramUsername, usernameHandle } = getTelegramConfig()
  if (!botToken) {
    return { ok: false, fallback: true, method: 'telegram', message: 'Telegram bot token missing' }
  }

  const targetChatId = chatId || (telegramUsername ? `@${telegramUsername}` : usernameHandle || '')

  if (!targetChatId) {
    return { ok: false, fallback: true, method: 'telegram', message: 'Telegram target missing' }
  }

  try {
    const payload = new URLSearchParams({
      chat_id: String(targetChatId),
      text: String(code).trim(),
      disable_web_page_preview: 'true',
    })

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload,
    })

    const data = await response.json()
    if (!data.ok) {
      console.error('[admin-otp] telegram send failed', data)
      return { ok: false, fallback: true, method: 'telegram', message: data.description || 'Telegram send failed' }
    }

    return { ok: true, fallback: false, method: 'telegram', chatId: targetChatId, expiresInSeconds }
  } catch (error) {
    console.error('[admin-otp] telegram exception', error)
    return { ok: false, fallback: true, method: 'telegram', message: String(error) }
  }
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
