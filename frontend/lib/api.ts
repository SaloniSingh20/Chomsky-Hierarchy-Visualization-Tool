import {
  ClassifyResult,
  ExploreContent,
  HierarchyType,
  SimulationResult,
} from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    let message = 'Request failed'
    try {
      const errorBody = await response.json()
      message = errorBody.error || message
    } catch {
      message = response.statusText || message
    }
    throw new Error(message)
  }

  return (await response.json()) as T
}

export function getHierarchy(): Promise<HierarchyType[]> {
  return request<HierarchyType[]>('/hierarchy')
}

export function getHierarchyType(id: string): Promise<HierarchyType> {
  return request<HierarchyType>(`/type/${id}`)
}

export function simulateString(payload: {
  type: string
  string: string
}): Promise<SimulationResult> {
  return request<SimulationResult>('/simulate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function classifyGrammar(grammar: string): Promise<ClassifyResult> {
  return request<ClassifyResult>('/classify', {
    method: 'POST',
    body: JSON.stringify({ grammar }),
  })
}

export function getExploreContent(): Promise<ExploreContent> {
  return request<ExploreContent>('/explore-content')
}
