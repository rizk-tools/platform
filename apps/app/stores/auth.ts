import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from '@/lib/auth'

interface AuthState {
  session: any | null
  organizations: any[]
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
    reset
  }
}) 