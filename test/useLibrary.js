import React from 'react'
import { act, render, waitFor } from '@testing-library/react'
import { useLibrary } from '../src/useLibrary'

function TestComponent({varName, src, testRef}) {
    const [, status] = testRef.current = useLibrary(varName, src)

    return <span data-testid="status">{status}</span>
}

it('return existing library object', () => {
    window.foo = {}

    const ref = {}

    render(<TestComponent testRef={ref} varName="foo" src="https://example.com/foo.js"/>)

    expect(ref.current[1]).toBe('load')
    expect(ref.current[0]).toBe(window.foo)
})

it('load library from url', () => {
    window.exampleLibrary = undefined

    const ref = {}

    return act(async () => {
        render(<TestComponent testRef={ref} varName="exampleLibrary" src="https://ph-fritsche.github.io/react-weblibrary/exampleLibrary.js" />)

        expect(ref.current[1]).toBe('try')
        expect(ref.current[0]).toBe(undefined)

        await waitFor(() => expect(ref.current[1]).toEqual('load'))

        expect(ref.current[0]).toBeTruthy()
        expect(typeof(ref.current[0].echo)).toBe('function')
        expect(ref.current[0].echo('foo')).toBe('foo')
    })
})

it('fail loading library from url', () => {
    window.exampleLibrary = undefined

    const ref = {}
    const error = jest.spyOn(console, 'error').mockImplementation(() => {})

    return act(async () => {
        render(<TestComponent testRef={ref} varName="exampleLibrary" src="https://ph-fritsche.github.io/react-weblibrary/nonExistingLibrary.js" />)

        expect(ref.current[1]).toBe('try')
        expect(ref.current[0]).toBe(undefined)

        await waitFor(() => expect(ref.current[1]).toEqual('error'))

        // jsdom calls console.error when resource can not be found
        expect(error).toBeCalled()

        ref.current[2]() // tryAgain

        expect(ref.current[1]).toBe('try')

        await waitFor(() => expect(ref.current[1]).toEqual('error'))

        error.mockRestore()
    })
})

it('fail with script not providing variable', () => {
    window.foo = undefined

    const ref = {}

    return act(async () => {
        render(<TestComponent testRef={ref} varName="foo" src="https://ph-fritsche.github.io/react-weblibrary/exampleLibrary.js" />)

        expect(ref.current[1]).toBe('try')
        expect(ref.current[0]).toBe(undefined)

        await waitFor(() => expect(ref.current[1]).toEqual('error'))
    })
})
