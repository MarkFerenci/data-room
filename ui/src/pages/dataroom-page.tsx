import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { api, type DataRoom, type Folder, type File, type SearchResults } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ArrowLeft, FolderPlus, Upload, Search, FileText, Folder as FolderIcon, Trash2, Edit2, ChevronRight, Home, X, Filter } from 'lucide-react'
import { formatFileSize, formatDate } from '@/lib/utils'

export function DataroomPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [dataroom, setDataroom] = useState<DataRoom | null>(null)
  const [folders, setFolders] = useState<Folder[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchNames, setSearchNames] = useState(true)
  const [searchContent, setSearchContent] = useState(true)
  const [caseInsensitive, setCaseInsensitive] = useState(true)
  const [showSearchFilters, setShowSearchFilters] = useState(false)
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null)
  const [, setCurrentFolder] = useState<Folder | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: number | null; name: string }>>([])
  const [folderHistory, setFolderHistory] = useState<Array<{ id: number | null; name: string }>>([])
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [editFolderName, setEditFolderName] = useState('')
  const [editingFile, setEditingFile] = useState<File | null>(null)
  const [editFileName, setEditFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    if (!id) {
      return
    }

    // Load appropriate content based on current folder
    if (currentFolderId === null) {
      loadDataroom()
    } else {
      loadFolderContents()
    }
  }, [id, user, currentFolderId])

  async function loadDataroom() {
    setLoading(true)
    try {
      const response = await api.getDataroomStructure(Number(id))
      setDataroom(response.dataroom)
      setFolders(response.structure)
      setFiles(response.root_files)
      setCurrentFolder(null)
      const rootBreadcrumb = { id: null, name: response.dataroom.name }
      setBreadcrumbs([rootBreadcrumb])
      setFolderHistory([rootBreadcrumb])
    } catch (error) {
      alert(`Failed to load dataroom: ${error}`)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  async function loadFolderContents() {
    if (!currentFolderId) {
      return
    }
    
    setLoading(true)
    try {
      const response = await api.getFolderContents(currentFolderId)
      setCurrentFolder(response.folder)
      setFolders(response.folders)
      setFiles(response.files)
      
      // Build breadcrumbs from history
      // Check if this folder is already in history (user clicked a breadcrumb)
      const existingIndex = folderHistory.findIndex(f => f.id === response.folder.id)
      
      let newBreadcrumbs: Array<{ id: number | null; name: string }>
      if (existingIndex >= 0) {
        // User navigated back via breadcrumb, truncate history to this point
        newBreadcrumbs = folderHistory.slice(0, existingIndex + 1)
      } else {
        // User navigated forward into a new folder, append to history
        newBreadcrumbs = [...folderHistory, { id: response.folder.id, name: response.folder.name }]
      }
      
      setBreadcrumbs(newBreadcrumbs)
      setFolderHistory(newBreadcrumbs)
    } catch (error) {
      alert(`Failed to load folder: ${error}`)
      setCurrentFolderId(null)
    } finally {
      setLoading(false)
    }
  }

  function navigateToFolder(folderId: number | null) {
    // If navigating to the same folder, force a reload
    if (folderId === currentFolderId) {
      if (folderId === null) {
        loadDataroom()
      } else {
        loadFolderContents()
      }
    } else {
      setCurrentFolderId(folderId)
    }
  }

  function openFolder(folder: Folder) {
    // When opening a folder from the list, we're navigating forward
    setCurrentFolderId(folder.id)
  }

  async function createFolder() {
    if (!newFolderName.trim() || !dataroom) return

    try {
      await api.createFolder({
        name: newFolderName,
        dataroom_id: dataroom.id,
        parent_id: currentFolderId || undefined,
      })
      setNewFolderName('')
      setShowNewFolder(false)
      // Reload current view
      if (currentFolderId === null) {
        loadDataroom()
      } else {
        loadFolderContents()
      }
    } catch (error) {
      alert(`Failed to create folder: ${error}`)
    }
  }

  function startEditFolder(folder: Folder, event: React.MouseEvent) {
    event.stopPropagation()
    setEditingFolder(folder)
    setEditFolderName(folder.name)
  }

  async function updateFolder() {
    if (!editingFolder || !editFolderName.trim()) return

    try {
      await api.updateFolder(editingFolder.id, { name: editFolderName })
      setEditingFolder(null)
      setEditFolderName('')
      // Reload current view
      if (currentFolderId === null) {
        loadDataroom()
      } else {
        loadFolderContents()
      }
    } catch (error) {
      alert(`Failed to update folder: ${error}`)
    }
  }

  function cancelEditFolder() {
    setEditingFolder(null)
    setEditFolderName('')
  }

  async function deleteFolder(folderId: number, event: React.MouseEvent) {
    event.stopPropagation()
    if (!confirm('Are you sure you want to delete this folder and all its contents?')) return

    try {
      await api.deleteFolder(folderId)
      // Reload current view
      if (currentFolderId === null) {
        loadDataroom()
      } else {
        loadFolderContents()
      }
    } catch (error) {
      alert(`Failed to delete folder: ${error}`)
    }
  }

  function startEditFile(file: File, event: React.MouseEvent) {
    event.stopPropagation()
    setEditingFile(file)
    setEditFileName(file.name)
  }

  async function updateFile() {
    if (!editingFile || !editFileName.trim()) return

    try {
      await api.updateFile(editingFile.id, { name: editFileName })
      setEditingFile(null)
      setEditFileName('')
      // Reload current view
      if (currentFolderId === null) {
        loadDataroom()
      } else {
        loadFolderContents()
      }
    } catch (error) {
      alert(`Failed to update file: ${error}`)
    }
  }

  function cancelEditFile() {
    setEditingFile(null)
    setEditFileName('')
  }

  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !dataroom) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('dataroom_id', dataroom.id.toString())
    if (currentFolderId) {
      formData.append('folder_id', currentFolderId.toString())
    }

    try {
      await api.uploadFile(formData)
      // Reload current view
      if (currentFolderId === null) {
        loadDataroom()
      } else {
        loadFolderContents()
      }
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      alert(`Failed to upload file: ${error}`)
    }
  }

  async function deleteFile(fileId: number, event?: React.MouseEvent) {
    if (event) event.stopPropagation()
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      await api.deleteFile(fileId)
      // Reload current view
      if (currentFolderId === null) {
        loadDataroom()
      } else {
        loadFolderContents()
      }
    } catch (error) {
      alert(`Failed to delete file: ${error}`)
    }
  }

  async function downloadFile(fileId: number, fileName: string) {
    try {
      const response = await api.downloadFile(fileId)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert(`Failed to download file: ${error}`)
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim() || !dataroom) return

    // Validate that at least one search type is selected
    if (!searchNames && !searchContent) {
      alert('Please select at least one search option')
      return
    }

    setSearching(true)
    try {
      const results = await api.search(searchQuery, dataroom.id, searchNames, searchContent, caseInsensitive)
      setSearchResults(results)
    } catch (error) {
      alert(`Search failed: ${error}`)
    } finally {
      setSearching(false)
    }
  }

  function clearSearch() {
    setSearchQuery('')
    setSearchResults(null)
    setShowSearchFilters(false)
  }

  function navigateToSearchResult(result: SearchResults['results'][0]) {
    // Clear search and navigate to the result's location
    clearSearch()
    
    if (result.type === 'folder') {
      // Navigate to the folder
      setCurrentFolderId(result.id)
    } else if (result.type === 'file') {
      if (result.folder) {
        // Navigate to the folder containing the file
        setCurrentFolderId(result.folder.id)
      } else {
        // File is in root, navigate to root
        setCurrentFolderId(null)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{dataroom?.name}</h1>
            <p className="text-sm text-muted-foreground">{dataroom?.description}</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-64"
              />
              {searchResults ? (
                <Button variant="outline" size="icon" onClick={clearSearch} title="Clear search">
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || searching}
                    title="Search"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  <Collapsible open={showSearchFilters} onOpenChange={setShowSearchFilters}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="icon" title="Search filters">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>
                </>
              )}
            </div>
            <Collapsible open={showSearchFilters} onOpenChange={setShowSearchFilters}>
              <CollapsibleContent>
                <div className="flex items-center gap-4 rounded-md border bg-muted/50 p-2">
                  <span className="text-sm font-medium">Search in:</span>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox 
                      checked={searchNames} 
                      onCheckedChange={(checked) => setSearchNames(checked as boolean)}
                    />
                    File/Folder names
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox 
                      checked={searchContent} 
                      onCheckedChange={(checked) => setSearchContent(checked as boolean)}
                    />
                    File content
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox 
                      checked={caseInsensitive} 
                      onCheckedChange={(checked) => setCaseInsensitive(checked as boolean)}
                    />
                    Case insensitive
                  </label>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <div className="border-b bg-muted/10">
        <div className="container mx-auto flex h-10 items-center gap-1 px-4 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id ?? 'root'} className="flex items-center gap-1">
              {index === 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 px-2"
                  onClick={() => navigateToFolder(null)}
                >
                  <Home className="h-4 w-4" />
                  {crumb.name}
                </Button>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  {index === breadcrumbs.length - 1 ? (
                    <span className="px-2 py-1 font-medium">{crumb.name}</span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => navigateToFolder(crumb.id)}
                    >
                      {crumb.name}
                    </Button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto flex h-12 items-center gap-2 px-4">
          <Button size="sm" onClick={() => setShowNewFolder(true)}>
            <FolderPlus className="h-4 w-4" />
            New Folder
          </Button>
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Upload PDF
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={uploadFile}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Search Results */}
        {searchResults ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Search Results: {searchResults.count} total ({searchResults.files_count} {searchResults.files_count === 1 ? 'file' : 'files'}, {searchResults.folders_count} {searchResults.folders_count === 1 ? 'folder' : 'folders'})
              </h2>
              <Button variant="outline" size="sm" onClick={clearSearch}>
                Back to Browse
              </Button>
            </div>
            <div className="space-y-2">
              {searchResults.results.map((result) => {
                if (result.type === 'folder') {
                  // Render folder result
                  return (
                    <Card key={`folder-${result.id}`} className="hover:bg-accent cursor-pointer" onClick={() => navigateToSearchResult(result)}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <FolderIcon className="h-8 w-8 text-blue-500" />
                        <div className="flex-1">
                          <p className="font-medium">{result.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {result.parent_folder ? (
                              <>
                                📁 {result.parent_folder.path} • <span className="text-blue-600">Folder</span>
                              </>
                            ) : (
                              <>
                                📁 Root • <span className="text-blue-600">Folder</span>
                              </>
                            )}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigateToSearchResult(result)
                          }}
                        >
                          Open Folder
                        </Button>
                      </CardContent>
                    </Card>
                  )
                } else {
                  // Render file result
                  const matchTypes = result.match_type || []
                  let matchType = ''
                  
                  if (matchTypes.includes('name') && matchTypes.includes('content')) {
                    matchType = 'Filename & Content match'
                  } else if (matchTypes.includes('name')) {
                    matchType = 'Filename match'
                  } else if (matchTypes.includes('content')) {
                    matchType = 'Content match'
                  }
                  
                  return (
                    <Card key={`file-${result.id}`} className="hover:bg-accent">
                      <CardContent className="flex items-center gap-4 p-4">
                        <FileText className="h-8 w-8 text-red-500" />
                        <div className="flex-1">
                          <p className="font-medium">{result.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {result.folder ? (
                              <>
                                📁 {result.folder.path} • {formatFileSize(result.file_size)} • <span className="text-blue-600">{matchType}</span>
                              </>
                            ) : (
                              <>
                                📁 Root • {formatFileSize(result.file_size)} • <span className="text-blue-600">{matchType}</span>
                              </>
                            )}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateToSearchResult(result)}
                        >
                          Go to Location
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(result.id, result.name)}
                        >
                          Download
                        </Button>
                      </CardContent>
                    </Card>
                  )
                }
              })}
              {searchResults.count === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium">No results found</p>
                    <p className="text-sm text-muted-foreground">
                      Try different keywords or check your spelling
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* New Folder Input */}
            {showNewFolder && (
              <Card className="mb-4">
                <CardContent className="flex items-center gap-2 p-4">
                  <Input
                    placeholder="Folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createFolder()}
                    autoFocus
                  />
                  <Button onClick={createFolder} disabled={!newFolderName.trim()}>
                    Create
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewFolder(false)}>
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Files and Folders List */}
            <div className="space-y-2">
          {/* Folders */}
          {folders.map((folder) => (
            <Card key={folder.id} className="cursor-pointer hover:bg-accent" onClick={() => openFolder(folder)}>
              <CardContent className="flex items-center gap-4 p-4">
                <FolderIcon className="h-8 w-8 text-blue-500" />
                {editingFolder?.id === folder.id ? (
                  <>
                    <Input
                      value={editFolderName}
                      onChange={(e) => setEditFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') updateFolder()
                        if (e.key === 'Escape') cancelEditFolder()
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1"
                      autoFocus
                    />
                    <Button size="sm" onClick={(e) => { e.stopPropagation(); updateFolder() }} disabled={!editFolderName.trim()}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); cancelEditFolder() }}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="font-medium">{folder.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(folder.created_at)}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => startEditFolder(folder, e)}
                      aria-label="Edit folder"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => deleteFolder(folder.id, e)}
                      aria-label="Delete folder"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Files */}
          {files.map((file) => (
            <Card key={file.id} className="hover:bg-accent">
              <CardContent className="flex items-center gap-4 p-4">
                <FileText className="h-8 w-8 text-red-500" />
                {editingFile?.id === file.id ? (
                  <>
                    <Input
                      value={editFileName}
                      onChange={(e) => setEditFileName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') updateFile()
                        if (e.key === 'Escape') cancelEditFile()
                      }}
                      className="flex-1"
                      autoFocus
                    />
                    <Button size="sm" onClick={updateFile} disabled={!editFileName.trim()}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEditFile}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => downloadFile(file.id, file.name)}
                    >
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.file_size)} • {formatDate(file.created_at)}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => startEditFile(file, e)}
                      aria-label="Edit file"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => deleteFile(file.id, e)}
                      aria-label="Delete file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}

          {folders.length === 0 && files.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">No files or folders yet</p>
                <p className="text-sm text-muted-foreground">
                  Upload files or create folders to get started
                </p>
              </CardContent>
            </Card>
          )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
