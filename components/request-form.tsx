"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { requestAPI, type ServiceRequest } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, CheckCircle } from "lucide-react"

export function RequestForm({ onLogout }: { onLogout: () => void }) {
  const { user, token } = useAuth()
  const [requests, setRequests] = useState<ServiceRequest[]>([
    {
      details: "",
      tasks: [{ task_type: "", details: "", description: "" }],
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const addRequest = () => {
    setRequests([
      ...requests,
      {
        details: "",
        tasks: [{ task_type: "", details: "", description: "" }],
      },
    ])
  }

  const removeRequest = (index: number) => {
    setRequests(requests.filter((_, i) => i !== index))
  }

  const addTask = (requestIndex: number) => {
    const newRequests = [...requests]
    newRequests[requestIndex].tasks.push({ task_type: "", details: "", description: "" })
    setRequests(newRequests)
  }

  const removeTask = (requestIndex: number, taskIndex: number) => {
    const newRequests = [...requests]
    newRequests[requestIndex].tasks = newRequests[requestIndex].tasks.filter((_, i) => i !== taskIndex)
    setRequests(newRequests)
  }

  const updateRequest = (index: number, field: string, value: string) => {
    const newRequests = [...requests]
    ;(newRequests[index] as any)[field] = value
    setRequests(newRequests)
  }

  const updateTask = (requestIndex: number, taskIndex: number, field: string, value: string) => {
    const newRequests = [...requests]
    ;(newRequests[requestIndex].tasks[taskIndex] as any)[field] = value
    setRequests(newRequests)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validation
    const isValid = requests.every(
      (req) => req.details.trim() && req.tasks.length > 0 && req.tasks.every((task) => task.task_type && task.details),
    )

    if (!isValid) {
      setError("Please fill in all required fields for each request")
      return
    }

    if (!token || !user) {
      setError("Authentication error")
      return
    }

    setIsLoading(true)

    try {
      await requestAPI.submitRequests(token, user.id, { requests })
      setSuccess(true)
      setRequests([
        {
          details: "",
          tasks: [{ task_type: "", details: "", description: "" }],
        },
      ])
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Errand Management</h1>
            <p className="text-muted-foreground">
              Welcome, {user?.first_name} {user?.last_name}
            </p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your requests have been submitted successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {requests.map((request, requestIndex) => (
            <Card key={requestIndex}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Service Request {requestIndex + 1}</CardTitle>
                    <CardDescription>Add details and tasks for this service request</CardDescription>
                  </div>
                  {requests.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequest(requestIndex)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Request Details */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Request Details *</label>
                  <Textarea
                    placeholder="Describe the main errand or service you need..."
                    value={request.details}
                    onChange={(e) => updateRequest(requestIndex, "details", e.target.value)}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>

                {/* Tasks */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Tasks</h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addTask(requestIndex)}
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Task
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {request.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="p-4 border rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm">Task {taskIndex + 1}</h4>
                          {request.tasks.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTask(requestIndex, taskIndex)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium mb-1 block">Task Type *</label>
                            <Input
                              placeholder="e.g., Management, Delivery"
                              value={task.task_type}
                              onChange={(e) => updateTask(requestIndex, taskIndex, "task_type", e.target.value)}
                              disabled={isLoading}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1 block">Task Details *</label>
                            <Input
                              placeholder="Brief task details"
                              value={task.details}
                              onChange={(e) => updateTask(requestIndex, taskIndex, "details", e.target.value)}
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium mb-1 block">Description</label>
                          <Textarea
                            placeholder="More details about this task"
                            value={task.description}
                            onChange={(e) => updateTask(requestIndex, taskIndex, "description", e.target.value)}
                            disabled={isLoading}
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Request Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent"
            onClick={addRequest}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Request
          </Button>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Service Requests"}
          </Button>
        </form>
      </div>
    </div>
  )
}
