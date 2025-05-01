"use client"

import * as React from "react"

import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 300 // Short delay for exit animation

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "success" | "error" | "warning" | "info"
  duration?: number
  progress?: number
  isPaused?: boolean
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
  UPDATE_PROGRESS: "UPDATE_PROGRESS",
  PAUSE_TOAST: "PAUSE_TOAST",
  RESUME_TOAST: "RESUME_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
      toastId: string
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["UPDATE_PROGRESS"]
      toastId: string
      progress: number
    }
  | {
      type: ActionType["PAUSE_TOAST"]
      toastId: string
    }
  | {
      type: ActionType["RESUME_TOAST"]
      toastId: string
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
const progressIntervals = new Map<string, ReturnType<typeof setInterval>>()
const startTimes = new Map<string, number>()
const pausedTimes = new Map<string, number>()
const remainingDurations = new Map<string, number>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

const startProgressTimer = (toastId: string, duration: number) => {
  if (progressIntervals.has(toastId)) {
    clearInterval(progressIntervals.get(toastId))
  }

  const startTime = Date.now()
  startTimes.set(toastId, startTime)
  remainingDurations.set(toastId, duration)

  const interval = setInterval(() => {
    const elapsedTime = Date.now() - startTime
    const progress = 100 - (elapsedTime / duration) * 100

    if (progress <= 0) {
      clearInterval(interval)
      progressIntervals.delete(toastId)
      dispatch({
        type: "DISMISS_TOAST",
        toastId,
      })
    } else {
      dispatch({
        type: "UPDATE_PROGRESS",
        toastId,
        progress,
      })
    }
  }, 10)

  progressIntervals.set(toastId, interval)
}

const pauseProgressTimer = (toastId: string) => {
  if (progressIntervals.has(toastId)) {
    clearInterval(progressIntervals.get(toastId))
    progressIntervals.delete(toastId)

    // Calculate remaining duration
    const startTime = startTimes.get(toastId) || 0
    const elapsedTime = Date.now() - startTime
    const originalDuration = remainingDurations.get(toastId) || 5000
    const remaining = originalDuration - elapsedTime

    remainingDurations.set(toastId, remaining)
    pausedTimes.set(toastId, Date.now())
  }
}

const resumeProgressTimer = (toastId: string) => {
  const remaining = remainingDurations.get(toastId)
  if (remaining) {
    startTimes.set(toastId, Date.now())

    const interval = setInterval(() => {
      const elapsedSinceResume = Date.now() - startTimes.get(toastId)!
      const progress = 100 - (elapsedSinceResume / remaining) * 100

      if (progress <= 0) {
        clearInterval(interval)
        progressIntervals.delete(toastId)
        dispatch({
          type: "DISMISS_TOAST",
          toastId,
        })
      } else {
        dispatch({
          type: "UPDATE_PROGRESS",
          toastId,
          progress,
        })
      }
    }, 10)

    progressIntervals.set(toastId, interval)
  }
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      const { duration } = action.toast
      if (duration !== Number.POSITIVE_INFINITY) {
        startProgressTimer(action.toast.id, duration!)
      }

      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toastId ? { ...t, ...action.toast } : t)),
      }

    case "UPDATE_PROGRESS":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toastId ? { ...t, progress: action.progress } : t)),
      }

    case "PAUSE_TOAST":
      pauseProgressTimer(action.toastId)
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toastId ? { ...t, isPaused: true } : t)),
      }

    case "RESUME_TOAST":
      resumeProgressTimer(action.toastId)
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toastId ? { ...t, isPaused: false } : t)),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Clear any existing timers
      if (toastId) {
        if (progressIntervals.has(toastId)) {
          clearInterval(progressIntervals.get(toastId))
          progressIntervals.delete(toastId)
        }
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          if (progressIntervals.has(toast.id)) {
            clearInterval(progressIntervals.get(toast.id))
            progressIntervals.delete(toast.id)
          }
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ variant = "success", duration = 5000, ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: props,
      toastId: id,
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
      variant,
      duration,
      progress: 100,
      isPaused: false,
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    pauseToast: (toastId: string) => dispatch({ type: "PAUSE_TOAST", toastId }),
    resumeToast: (toastId: string) => dispatch({ type: "RESUME_TOAST", toastId }),
  }
}

export { useToast, toast }
