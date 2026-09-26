import { generateOtpCode, getAdminCredentials, sendOtpEmail, sendOtpTelegram, setOtp, verifyOtp } from '../../lib/admin-auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action, username, password, code } = req.body || {}
  const credentials = getAdminCredentials()

  if (action === 'login') {
    const validUsername = String(username || '').trim() === credentials.username
    const validPassword = String(password || '').trim() === credentials.password

    if (!validUsername || !validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const otpCode = generateOtpCode(265)
    setOtp(credentials.username, otpCode)

    try {
      const telegramResult = await sendOtpTelegram({
        code: otpCode,
        username: credentials.username,
        expiresInSeconds: 60,
      })

      if (telegramResult.ok) {
        return res.status(200).json({
          ok: true,
          message: 'Confirmation code has been sent to Telegram',
          method: 'telegram',
          expiresInSeconds: 60,
          debugCode: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
        })
      }

      const emailResult = await sendOtpEmail({
        to: credentials.email,
        code: otpCode,
        username: credentials.username,
        expiresInSeconds: 60,
      })

      return res.status(200).json({
        ok: true,
        message: telegramResult.message ? `Telegram could not receive the code; sent to admin email instead: ${telegramResult.message}` : 'Confirmation code has been sent to the admin email',
        method: emailResult.fallback ? 'fallback-log' : 'email',
        email: credentials.email,
        expiresInSeconds: 60,
        debugCode: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
      })
    } catch (error) {
      console.error('Admin OTP send failed:', error)
      return res.status(500).json({ error: 'Unable to send confirmation code' })
    }
  }

  if (action === 'verify') {
    if (!username || !code) {
      return res.status(400).json({ error: 'Username and code are required' })
    }

    const validUsername = String(username || '').trim() === credentials.username
    if (!validUsername || !verifyOtp(credentials.username, code)) {
      return res.status(401).json({ error: 'Invalid or expired confirmation code' })
    }

    return res.status(200).json({
      ok: true,
      message: 'Admin access granted',
      hash: credentials.hash,
    })
  }

  return res.status(400).json({ error: 'Unsupported action' })
}
