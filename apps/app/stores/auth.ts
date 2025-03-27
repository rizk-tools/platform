import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from '@/lib/auth'
import type { Organization } from 'better-auth/plugins/organization'

interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  image?: string | null
}

interface Session {
  user: User
  session: {
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
    expiresAt: Date
    token: string
    ipAddress?: string | null
    userAgent?: string | null
    activeOrganizationId?: string | null
  }
}

interface AuthState {
  session: Session | null
  organizations: Organization[]
  isLoading: boolean
  isInitialized: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const session = ref<AuthState['session']>(null)
  const organizations = ref<AuthState['organizations']>([])
  const isLoading = ref(true)
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => !!session.value)
  const hasOrganizations = computed(() => organizations.value.length > 0)

  async function initialize () {
    if (isInitialized.value) return

    try {
      isLoading.value = true
      const [sessionResponse, orgsResponse] = await Promise.all([
        auth.getSession(),
        auth.organization.list()
      ])

      session.value = sessionResponse.data
      organizations.value = orgsResponse.data || []
    } catch (error) {
      console.error('Failed to initialize auth store:', error)
      session.value = null
      organizations.value = []
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  async function setActiveOrganization (organizationId: string) {
    try {
      const response = await auth.organization.setActive({ organizationId })
      if (session.value) {
        session.value = {
          ...session.value,
          session: {
            ...session.value.session,
            activeOrganizationId: organizationId
          }
        }
      }
      return response
    } catch (error) {
      console.error('Failed to set active organization:', error)
      throw error
    }
  }

  function reset () {
    session.value = null
    organizations.value = []
    isInitialized.value = false
  }

  return {
    // state
    session,
    organizations,
    isLoading,
    isInitialized,
    // getters
    isAuthenticated,
    hasOrganizations,
    // actions
    initialize,
    setActiveOrganization,
    reset
  }
}) 