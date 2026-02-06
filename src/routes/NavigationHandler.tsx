import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setNavigate } from '../lib/navigation'

export default function NavigationHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    setNavigate(navigate)
  }, [navigate])

  return null
}
