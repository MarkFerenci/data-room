import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { api, type DataRoom } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Folder, Plus, LogOut, Edit, Trash } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [datarooms, setDatarooms] = useState<DataRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newDataroomName, setNewDataroomName] = useState('')
  const [newDataroomDescription, setNewDataroomDescription] = useState('')
  const [editingDataroom, setEditingDataroom] = useState<DataRoom | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user) {
      loadDatarooms()
    }
  }, [user])

  async function loadDatarooms() {
    try {
      const response = await api.listDatarooms()
      setDatarooms(response.datarooms)
    } catch (error) {
      console.error('Failed to load datarooms:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createDataroom() {
    if (!newDataroomName.trim()) return

    try {
      await api.createDataroom({
        name: newDataroomName,
        description: newDataroomDescription || undefined,
      })
      setNewDataroomName('')
      setNewDataroomDescription('')
      setShowCreateDialog(false)
      loadDatarooms()
    } catch (error) {
      alert(`Failed to create dataroom: ${error}`)
    }
  }

  function startEditDataroom(dataroom: DataRoom, event: React.MouseEvent) {
    event.stopPropagation()
    setEditingDataroom(dataroom)
    setEditName(dataroom.name)
    setEditDescription(dataroom.description || '')
  }

  async function updateDataroom() {
    if (!editingDataroom || !editName.trim()) return

    try {
      await api.updateDataroom(editingDataroom.id, {
        name: editName,
        description: editDescription || undefined,
      })
      setEditingDataroom(null)
      setEditName('')
      setEditDescription('')
      loadDatarooms()
    } catch (error) {
      alert(`Failed to update dataroom: ${error}`)
    }
  }

  function cancelEdit() {
    setEditingDataroom(null)
    setEditName('')
    setEditDescription('')
  }

  async function deleteDataroom(dataroom: DataRoom, event: React.MouseEvent) {
    event.stopPropagation()
    if (!confirm(`Are you sure you want to delete "${dataroom.name}"?`)) return

    try {
      await api.deleteDataroom(dataroom.id)
      loadDatarooms()
    } catch (error) {
      alert(`Failed to delete dataroom: ${error}`)
    }
  }

  if (authLoading || loading) {
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
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Data Room</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button onClick={logout} variant="outline" size="sm">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">My Data Rooms</h2>
            <p className="text-muted-foreground">Manage your secure document repositories</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" />
            New Data Room
          </Button>
        </div>

        {/* Create Dialog */}
        {showCreateDialog && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Data Room</CardTitle>
              <CardDescription>Set up a new secure document repository</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Name</label>
                <Input
                  placeholder="Acquisition Project Q4"
                  value={newDataroomName}
                  onChange={(e) => setNewDataroomName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Description (optional)</label>
                <Input
                  placeholder="Documents for Q4 acquisition due diligence"
                  value={newDataroomDescription}
                  onChange={(e) => setNewDataroomDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createDataroom} disabled={!newDataroomName.trim()}>
                  Create
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        {editingDataroom && (
          <div role="dialog" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Edit Data Room</CardTitle>
                <CardDescription>Update data room details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Name</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Description (optional)</label>
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={updateDataroom} disabled={!editName.trim()}>
                    Save
                  </Button>
                  <Button variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Datarooms Grid */}
        {datarooms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Folder className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">No data rooms yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first data room to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {datarooms.map((dataroom) => (
              <Card
                key={dataroom.id}
                className="cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() => navigate(`/dataroom/${dataroom.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <Folder className="h-5 w-5" />
                      {dataroom.name}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => startEditDataroom(dataroom, e)}
                        aria-label="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => deleteDataroom(dataroom, e)}
                        aria-label="Delete"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {dataroom.description && (
                    <CardDescription>{dataroom.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Files: {dataroom.stats?.total_files || 0}</p>
                    <p>Folders: {dataroom.stats?.total_folders || 0}</p>
                    <p>Created: {formatDate(dataroom.created_at)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
