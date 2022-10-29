import { useEffect, useRef, useState } from 'react'
import type { WritableKeys } from 'ts-essentials'

function getFromWindow(varName: string) {
    return (window as unknown as {[k: string]: unknown})[varName]
}

export function useLibrary<T>(varName: string, src: string, props: { [k in WritableKeys<HTMLScriptElement>]?: HTMLScriptElement[k] } = {})
    : [library: T, status: string, tryAgain: () => void]
{
    const library = useRef(getFromWindow(varName))
    const [status, setStatus] = useState(library.current ? 'load' : 'try')

    useEffect(() => {
        if (status !== 'try') {
            return
        }

        const el = document.createElement('script')
        el.src = src

        Object.keys(props).forEach(k => {
            el[k as keyof typeof props] = props[k as keyof typeof props] as never
        })

        el.addEventListener('load', () => {
            library.current = getFromWindow(varName)
            setStatus(library.current ? 'load' : 'error')
        })
        el.addEventListener('error', () => setStatus('error'))
        el.addEventListener('abort', () => setStatus('abort'))

        document.body.appendChild(el)

        return () => { document.body.removeChild(el) }

        // eslint-disable-next-line react-hooks/exhaustive-deps -- props might change every render
    }, [varName, src, status])

    const tryAgain = ['try', 'load'].includes(status)
        ? () => { return }
        : () => setStatus('try')

    return [library.current, status, tryAgain]
}
