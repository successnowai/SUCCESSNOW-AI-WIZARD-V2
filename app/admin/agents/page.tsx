'use client'
import { useState, useEffect } from 'react'
import { AIAgent } from '@/types'
import { WIZARD_STEPS } from '@/utils/constants'
import { Bot, Edit2, Save, X, Sparkles } from 'lucide-react'
import { toast } from '@/components/ui/Toaster'

export default function AdminAgents() {
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [editingAgent, setEditingAgent] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<AIAgent>>({})

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/admin/agents')
      if (response.ok) {
        const data = await response.json()
        setAgents(data.agents || [])
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
      toast.error('Failed to load AI agents')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (agent: AIAgent) => {
    setEditingAgent(agent.step_number)
    setEditForm(agent)
  }

  const cancelEdit = () => {
    setEditingAgent(null)
    setEditForm({})
  }

  const saveAgent = async () => {
    if (!editingAgent) return

    try {
      const response = await fetch(`/api/admin/agents/${editingAgent}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        toast.success('Agent updated successfully')
        fetchAgents()
        cancelEdit()
      } else {
        throw new Error('Failed to update agent')
      }
    } catch (error) {
      console.error('Error saving agent:', error)
      toast.error('Failed to update agent')
    }
  }

  const getStepInfo = (stepNumber: number) => {
    return WIZARD_STEPS.find(s => s.stepNumber === stepNumber)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal">AI Agents Configuration</h1>
        <p className="text-gray-600 mt-2">Configure AI agents for each wizard step</p>
      </div>

      {/* Agents List */}
      <div className="space-y-6">
        {agents.map((agent) => {
          const stepInfo = getStepInfo(agent.step_number)
          const isEditing = editingAgent === agent.step_number

          return (
            <div key={agent.id} className="glass-card p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">{stepInfo?.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-charcoal">
                      Step {agent.step_number}: {agent.name}
                    </h3>
                    <p className="text-gray-600">{agent.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {agent.is_active ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      Inactive
                    </span>
                  )}
                  {!isEditing ? (
                    <button
                      onClick={() => startEdit(agent)}
                      className="btn-secondary p-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={saveAgent}
                        className="btn-primary p-2"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="btn-secondary p-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Agent Details */}
              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Personality</h4>
                    <p className="text-sm text-gray-600 capitalize">{agent.personality}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Intro Message</h4>
                    <p className="text-sm text-gray-600 italic">"{agent.intro_message}"</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">System Prompt</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {agent.system_prompt}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Model Settings</h4>
                    <div className="flex space-x-4 text-sm text-gray-600">
                      <span>Model: {agent.model}</span>
                      <span>Temperature: {agent.temperature}</span>
                      <span>Max Tokens: {agent.max_tokens}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Agent Name</label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Role</label>
                    <input
                      type="text"
                      value={editForm.role || ''}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Personality</label>
                    <select
                      value={editForm.personality || ''}
                      onChange={(e) => setEditForm({ ...editForm, personality: e.target.value })}
                      className="form-input"
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="creative">Creative</option>
                      <option value="analytical">Analytical</option>
                      <option value="motivational">Motivational</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Intro Message</label>
                    <textarea
                      value={editForm.intro_message || ''}
                      onChange={(e) => setEditForm({ ...editForm, intro_message: e.target.value })}
                      className="form-textarea"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="form-label">System Prompt</label>
                    <textarea
                      value={editForm.system_prompt || ''}
                      onChange={(e) => setEditForm({ ...editForm, system_prompt: e.target.value })}
                      className="form-textarea"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">Model</label>
                      <select
                        value={editForm.model || ''}
                        onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                        className="form-input"
                      >
                        <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                        <option value="gpt-4">GPT-4</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Temperature</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={editForm.temperature || 0.7}
                        onChange={(e) => setEditForm({ ...editForm, temperature: parseFloat(e.target.value) })}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Max Tokens</label>
                      <input
                        type="number"
                        min="100"
                        max="4000"
                        value={editForm.max_tokens || 2000}
                        onChange={(e) => setEditForm({ ...editForm, max_tokens: parseInt(e.target.value) })}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.is_active || false}
                        onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="form-label mb-0">Active</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
