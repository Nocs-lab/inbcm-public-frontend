import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  email: string
  name: string
}

interface State {
  user: User | null
  setUser: (user: User | null) => void
}

export const useStore = create(
  persist<State>(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export default useStore
