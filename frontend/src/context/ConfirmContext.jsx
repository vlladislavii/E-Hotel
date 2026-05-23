import { createContext, useState, useCallback, useRef } from 'react'
import ConfirmDialog from '../components/common/ConfirmDialog'

export const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [options, setOptions] = useState(null)
  const resolverRef = useRef(null)

  const confirm = useCallback((opts) => {
    setOptions(opts || {})
    return new Promise((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const close = useCallback((result) => {
    setOptions(null)
    if (resolverRef.current) {
      resolverRef.current(result)
      resolverRef.current = null
    }
  }, [])

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        isOpen={options !== null}
        options={options || {}}
        onConfirm={() => close(true)}
        onCancel={() => close(false)}
      />
    </ConfirmContext.Provider>
  )
}
