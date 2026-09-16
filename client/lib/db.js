import fs from 'fs'
import path from 'path'

const submissionsPath = path.join(process.cwd(), 'data', 'submissions.json')

export function readAll() {
  try {
    const raw = fs.readFileSync(submissionsPath, 'utf8')
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    return []
  }
}

export function saveOne(entry) {
  const all = readAll()
  all.push(entry)

  fs.mkdirSync(path.dirname(submissionsPath), { recursive: true })
  fs.writeFileSync(submissionsPath, `${JSON.stringify(all, null, 2)}\n`)

  return entry
}
