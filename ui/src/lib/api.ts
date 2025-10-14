// Auto-detect backend URL: use environment variable if set, otherwise use same origin
const getApiBase = (): string => {
  const envUrl = import.meta.env.VITE_BACKEND_URL
  if (envUrl) {
    return `${envUrl}/api`
  }
  // In production on Vercel, backend is on same domain via routing
  // In development, Vite proxy handles /api requests
  return '/api'
}

const API_BASE = getApiBase()

interface ApiError {
  error: string
}

class ApiClient {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: 'An error occurred',
      }))
      throw new Error(error.error)
    }

    return response.json()
  }

  // Auth
  async getLoginUrl() {
    return this.request<{ auth_url: string }>('/auth/login')
  }

  async getCurrentUser() {
    return this.request<{ user: User }>('/auth/me')
  }

  async logout() {
    localStorage.removeItem('auth_token')
    return this.request('/auth/logout', { method: 'POST' })
  }

  // Datarooms
  async listDatarooms() {
    return this.request<{ datarooms: DataRoom[] }>('/datarooms')
  }

  async createDataroom(data: { name: string; description?: string }) {
    return this.request<{ dataroom: DataRoom }>('/datarooms', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getDataroom(id: number) {
    return this.request<{ dataroom: DataRoom }>(`/datarooms/${id}`)
  }

  async updateDataroom(id: number, data: Partial<DataRoom>) {
    return this.request<{ dataroom: DataRoom }>(`/datarooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteDataroom(id: number) {
    return this.request<{ message: string }>(`/datarooms/${id}`, {
      method: 'DELETE',
    })
  }

  async getDataroomStructure(id: number) {
    return this.request<DataroomStructure>(`/datarooms/${id}/structure`)
  }

  // Folders
  async createFolder(data: { name: string; dataroom_id: number; parent_id?: number }) {
    return this.request<{ folder: Folder }>('/folders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getFolder(id: number) {
    return this.request<{ folder: Folder }>(`/folders/${id}`)
  }

  async updateFolder(id: number, data: { name: string }) {
    return this.request<{ folder: Folder }>(`/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteFolder(id: number) {
    return this.request<{ message: string }>(`/folders/${id}`, {
      method: 'DELETE',
    })
  }

  async getFolderContents(id: number) {
    return this.request<FolderContents>(`/folders/${id}/contents`)
  }

  // Files
  async uploadFile(formData: FormData) {
    const response = await fetch(`${API_BASE}/files`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: formData,
    })

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: 'Upload failed',
      }))
      throw new Error(error.error)
    }

    return response.json() as Promise<{ file: File }>
  }

  async getFile(id: number) {
    return this.request<{ file: File }>(`/files/${id}`)
  }

  async downloadFile(id: number) {
    const response = await fetch(`${API_BASE}/files/${id}/download`, {
      headers: this.getAuthHeader(),
    })

    if (!response.ok) {
      throw new Error('Download failed')
    }

    return response
  }

  async updateFile(id: number, data: { name?: string; folder_id?: number }) {
    return this.request<{ file: File }>(`/files/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteFile(id: number) {
    return this.request<{ message: string }>(`/files/${id}`, {
      method: 'DELETE',
    })
  }

  // Search
  async search(query: string, dataroomId?: number, searchNames = true, searchContent = true, caseInsensitive = true) {
    const params = new URLSearchParams({ q: query })
    if (dataroomId) params.append('dataroom_id', dataroomId.toString())
    params.append('search_names', searchNames.toString())
    params.append('search_content', searchContent.toString())
    params.append('case_insensitive', caseInsensitive.toString())

    return this.request<SearchResults>(`/search?${params}`)
  }
}

export const api = new ApiClient()

// Types
export interface User {
  id: number
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

export interface DataRoom {
  id: number
  name: string
  description?: string
  owner_id: number
  created_at: string
  updated_at: string
  stats?: {
    total_folders: number
    total_files: number
  }
}

export interface Folder {
  id: number
  name: string
  parent_id?: number
  dataroom_id: number
  path: string
  created_at: string
  updated_at: string
  children?: Folder[]
  files?: File[]
}

export interface File {
  id: number
  name: string
  original_name: string
  folder_id?: number
  dataroom_id: number
  file_size: number
  mime_type: string
  created_at: string
  updated_at: string
}

export interface DataroomStructure {
  dataroom: DataRoom
  structure: Folder[]
  root_files: File[]
}

export interface FolderContents {
  folder: Folder
  folders: Folder[]
  files: File[]
}

export interface SearchResults {
  query: string
  count: number
  files_count: number
  folders_count: number
  results: Array<
    | (File & {
        type: 'file'
        match_type: ('name' | 'content')[]
        dataroom: { id: number; name: string }
        folder?: { id: number; name: string; path: string }
      })
    | (Folder & {
        type: 'folder'
        match_type: ['name']
        dataroom: { id: number; name: string }
        parent_folder?: { id: number; name: string; path: string }
      })
  >
}
