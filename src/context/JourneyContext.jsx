import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'

// ────────────────────────────────────────────────────────────────────────────
// Journey Context — tracks every meaningful action a user takes in Finet
// ────────────────────────────────────────────────────────────────────────────

export const JourneyContext = createContext(null)

const DEFAULT_JOURNEY = {
  // Profile (from FinCoach quiz)
  profile: null,           // { tier, tierInfo, goalText, capitalContext, nextStep, answers }

  // XP + level
  xp: 0,
  level: 1,

  // Feature engagement flags
  seenOnboarding: false,
  visitedPages: [],        // list of route paths visited
  completedActions: [],    // 'added_transaction', 'set_income', 'added_investment', etc.

  // Roadmap progress (from FinCoach)
  roadmapDone: [],         // ids of completed roadmap steps

  // Streak
  lastVisit: null,
  streak: 0,

  // Coach
  coachMinimized: false,
  cognitionHistory: [],    // list of IDs/titles of mastered topics
}

const XP_REWARDS = {
  page_visit:          5,
  added_transaction:   15,
  set_income:          20,
  added_investment:    25,
  added_loan:          20,
  added_node:          15,
  roadmap_step:        30,
  read_article:        10,
  booked_mentor:       40,
  joined_challenge:    20,
  completed_quiz:      50,
}

function ls(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback }
  catch { return fallback }
}

export function JourneyProvider({ children }) {
  const { user } = useAuth()
  const [journey, setJourney] = useState(() => ls('finet:journey', DEFAULT_JOURNEY))
  const syncTimeoutRef = useRef(null)

  // 1. Sync FROM server when user logs in/changes
  useEffect(() => {
    // Merge server data with defaults to ensure no missing properties
    if (user?.journey) {
      setJourney(prev => ({ 
        ...DEFAULT_JOURNEY, 
        ...user.journey,
        // Only keep the local profile if the server's is truly empty
        profile: user.journey.profile || prev.profile 
      }))
    }
  }, [user])

  // 2. Sync TO server when journey changes (Debounced)
  useEffect(() => {
    // Always persist to localStorage for instant local feedback/guest mode
    localStorage.setItem('finet:journey', JSON.stringify(journey))

    if (user) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = setTimeout(() => {
        api.post('/user/journey', journey)
          .catch(err => console.error('[JourneySync] failed', err))
      }, 2000) // 2 sec debounce
    }
    
    return () => { if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current) }
  }, [journey, user])

  // ── Helpers ──────────────────────────────────────────────────────────────
  const awardXP = useCallback((amountOrAction) => {
    let reward = 0
    if (typeof amountOrAction === 'number') {
      reward = amountOrAction
    } else {
      reward = XP_REWARDS[amountOrAction] || 0
    }
    
    if (!reward) return
    setJourney(prev => {
      const newXP = (prev.xp || 0) + reward
      const newLevel = Math.floor(newXP / 100) + 1
      return { ...prev, xp: newXP, level: newLevel }
    })
  }, [])

  const markTopicMastered = useCallback((topicId) => {
    setJourney(prev => {
      if (prev.cognitionHistory.includes(topicId)) return prev
      return { ...prev, cognitionHistory: [...prev.cognitionHistory, topicId] }
    })
    awardXP(15) // Standard bonus for mastery
  }, [awardXP])

  const trackPage = useCallback((path) => {
    setJourney(prev => {
      if (prev.visitedPages.includes(path)) return prev
      const newPages = [...prev.visitedPages, path]
      return { ...prev, visitedPages: newPages }
    })
    awardXP('page_visit')
  }, [awardXP])

  const trackAction = useCallback((action) => {
    setJourney(prev => {
      if (prev.completedActions.includes(action)) return prev
      return { ...prev, completedActions: [...prev.completedActions, action] }
    })
    awardXP(action)
  }, [awardXP])

  const setProfile = useCallback((profile) => {
    setJourney(prev => ({ ...prev, profile }))
    awardXP('completed_quiz')
  }, [awardXP])

  const completeRoadmapStep = useCallback((stepId) => {
    setJourney(prev => {
      if (prev.roadmapDone.includes(stepId)) return prev
      return { ...prev, roadmapDone: [...prev.roadmapDone, stepId] }
    })
    awardXP('roadmap_step')
  }, [awardXP])

  const markOnboardingSeen = useCallback(() => {
    setJourney(prev => ({ ...prev, seenOnboarding: true }))
  }, [])

  const resetJourney = useCallback(() => {
    setJourney(DEFAULT_JOURNEY)
  }, [])

  // Streak calculation
  useEffect(() => {
    const today = new Date().toDateString()
    setJourney(prev => {
      if (prev.lastVisit === today) return prev
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      const newStreak = prev.lastVisit === yesterday ? prev.streak + 1 : 1
      return { ...prev, lastVisit: today, streak: newStreak }
    })
  }, [])

  const xpToNextLevel = 100
  const xpInLevel = (journey?.xp || 0) % xpToNextLevel
  const levelProgress = Math.round((xpInLevel / xpToNextLevel) * 100)

  const value = {
    journey,
    awardXP,
    markTopicMastered,
    trackPage,
    trackAction,
    setProfile,
    completeRoadmapStep,
    markOnboardingSeen,
    resetJourney,
    xpInLevel,
    levelProgress,
    xpToNextLevel,
  }

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
}

export function useJourney() {
  return useContext(JourneyContext)
}
