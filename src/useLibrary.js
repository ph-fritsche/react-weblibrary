import { useEffect, useRef, useState } from 'react'

export function useLibray(varName, src, props = {}) {
    const library = useRef(window[varName])
    const [status, setStatus] = useState(library.current ? 'load' : 'try')

    useEffect(() => {
        if (status !== 'try') {
            return
        }

        const el = document.createElement('script')
        el.id = 'script-' + btoa(src) + Math.random()
        el.src = src

        Object.keys(props).forEach(k => el[k] = props[k])

        el.addEventListener('load', () => {
            library.current = window[varName]
            setStatus(library.current ? 'load' : 'error')
        })
        el.addEventListener('error', () => setStatus('error'))
        el.addEventListener('abort', () => setStatus('abort'))

        document.body.appendChild(el)

        return () => document.body.removeChild(el)

        // eslint-disable-next-line react-hooks/exhaustive-deps -- props might change every render
    }, [varName, src, status])

    const tryAgain = ['try', 'load'].includes(status)
        ? () => { }
        : () => setStatus('try')

    return [library.current, status, tryAgain]
}
