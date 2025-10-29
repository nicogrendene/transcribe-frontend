import { Subtitle } from '../types'

export const parseWebVTT = (webvttText: string): Subtitle[] => {
  const subtitles: Subtitle[] = []
  
  try {
    if (!webvttText.includes('-->') || webvttText.length < 50) {
      const text = webvttText.replace(/^WEBVTT\s*/, '').replace(/\d+\s*/g, '').trim()
      if (text && text.length > 10) {
        subtitles.push({ start: 0, end: 999999, text: text })
      }
      return subtitles
    }
    
    const lines = webvttText.split('\n')
    let currentSubtitle: Partial<Subtitle> = {}
    let isInCue = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (line === 'WEBVTT' || line === '' || line.startsWith('NOTE')) continue
      
      if (line.includes('-->')) {
        const [start, end] = line.split(' --> ')
        if (start && end) {
          try {
            currentSubtitle.start = parseTimeToSeconds(start.trim())
            currentSubtitle.end = parseTimeToSeconds(end.trim())
            isInCue = true
          } catch (error) {
            isInCue = false
          }
        }
        continue
      }
      
      if (isInCue && line !== '' && !line.match(/^\d+$/)) {
        currentSubtitle.text = (currentSubtitle.text || '') + line + ' '
      }
      
      if (line === '' && isInCue && currentSubtitle.text) {
        subtitles.push({
          start: currentSubtitle.start!,
          end: currentSubtitle.end!,
          text: currentSubtitle.text.trim()
        })
        currentSubtitle = {}
        isInCue = false
      }
      
      if (line.match(/^\d+$/) && isInCue && currentSubtitle.text) {
        subtitles.push({
          start: currentSubtitle.start!,
          end: currentSubtitle.end!,
          text: currentSubtitle.text.trim()
        })
        currentSubtitle = {}
        isInCue = false
      }
    }
    
    if (isInCue && currentSubtitle.text) {
      subtitles.push({
        start: currentSubtitle.start!,
        end: currentSubtitle.end!,
        text: currentSubtitle.text.trim()
      })
    }
    
    if (subtitles.length === 0) {
      const text = webvttText.replace(/^WEBVTT\s*/, '').replace(/\d+\s*/g, '').trim()
      if (text && text.length > 10) {
        subtitles.push({ start: 0, end: 999999, text: text })
      }
    }
    
  } catch (error) {
    const text = webvttText.replace(/^WEBVTT\s*/, '').replace(/\d+\s*/g, '').trim()
    if (text && text.length > 10) {
      subtitles.push({ start: 0, end: 999999, text: text })
    }
  }
  
  return subtitles
}

const parseTimeToSeconds = (timeStr: string): number => {
  const parts = timeStr.split(':')
  if (parts.length === 3) {
    const hours = parseInt(parts[0])
    const minutes = parseInt(parts[1])
    const seconds = parseFloat(parts[2])
    return hours * 3600 + minutes * 60 + seconds
  } else if (parts.length === 2) {
    const minutes = parseInt(parts[0])
    const seconds = parseFloat(parts[1])
    return minutes * 60 + seconds
  }
  return 0
}

