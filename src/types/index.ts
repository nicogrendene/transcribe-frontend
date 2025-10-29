export interface Video {
  id: string
  title: string
  source_file: string
  source: string
  location: string
  duration: string
  metadata?: VideoMetadata
  qualities?: Quality[]
}

export interface VideoMetadata {
  id: string
  size: number
  duration?: string
  width?: number
  height?: number
  bitrate?: number
  format: string
  last_modified: string
  has_thumbnail: boolean
  has_subtitles: boolean
  has_summary: boolean
}

export interface Quality {
  name: string
  label: string
  file: string
  available: boolean
}

export interface Subtitle {
  start: number
  end: number
  text: string
}

export interface SearchResult {
  id: string
  text: string
  start_sec: number
  end_sec?: number
  score: number
  title?: string
  source?: string
  source_file?: string
  video_id?: string
  chunk_id?: string
}

