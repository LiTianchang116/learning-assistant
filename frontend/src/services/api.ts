import axios from 'axios'
import { getSessionId } from '../utils/session'

const api = axios.create({ baseURL: '/api' })

// Format
export async function uploadFormatFiles(files: File[]) {
  const form = new FormData()
  files.forEach(f => form.append('files', f))
  const res = await api.post('/format/upload', form)
  return res.data
}

export async function modifyDocuments(filePaths: string[], message: string) {
  const form = new FormData()
  filePaths.forEach(p => form.append('file_paths', p))
  form.append('message', message)
  form.append('session_id', getSessionId())
  const res = await api.post('/format/modify', form)
  return res.data
}

export function getDownloadUrl(filename: string) {
  return `/api/format/download/${encodeURIComponent(filename)}`
}

// WordFreq
export async function analyzeWordFreq(files: File[], useStopwords: boolean, minFreq: number) {
  const form = new FormData()
  files.forEach(f => form.append('files', f))
  form.append('use_stopwords', String(useStopwords))
  form.append('min_freq', String(minFreq))
  const res = await api.post('/wordfreq/analyze', form)
  return res.data
}

export async function exportWordFreqExcel(words: any[]) {
  const form = new FormData()
  form.append('words', JSON.stringify(words))
  const res = await api.post('/wordfreq/export', form, { responseType: 'blob' })
  return res.data
}

// Mindmap
export async function generateMindmap(text?: string, file?: File) {
  const form = new FormData()
  if (text) form.append('text', text)
  if (file) form.append('file', file)
  form.append('session_id', getSessionId())
  const res = await api.post('/mindmap/generate', form)
  return res.data
}

export async function regenerateMindmap(markdown: string, feedback: string) {
  const form = new FormData()
  form.append('markdown', markdown)
  form.append('feedback', feedback)
  form.append('session_id', getSessionId())
  const res = await api.post('/mindmap/regenerate', form)
  return res.data
}

// Learning Path
export async function generateLearningPath(subject: string, level: string, goal: string, timeAvailable: string) {
  const form = new FormData()
  form.append('subject', subject)
  form.append('level', level)
  form.append('goal', goal)
  form.append('time_available', timeAvailable)
  form.append('session_id', getSessionId())
  const res = await api.post('/learning/generate', form)
  return res.data
}
