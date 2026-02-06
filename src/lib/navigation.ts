import type { NavigateFunction } from 'react-router-dom'

let navigate: NavigateFunction | null = null

export const setNavigate = (nextNavigate: NavigateFunction) => {
  navigate = nextNavigate
}

export const redirectTo = (path: string, replace = true) => {
  if (navigate) {
    navigate(path, { replace })
    return
  }

  window.location.href = path
}
