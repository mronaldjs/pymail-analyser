import { describe, it, expect } from 'vitest'
import { isValidHttpUrl, normalizeUnsubscribeLink } from '../unsubscribeLink'

describe('isValidHttpUrl', () => {
  it('aceita http e https', () => {
    expect(isValidHttpUrl('http://example.com/unsub')).toBe(true)
    expect(isValidHttpUrl('https://example.com/unsub')).toBe(true)
  })

  it('rejeita mailto e strings inválidas', () => {
    expect(isValidHttpUrl('mailto:unsub@example.com')).toBe(false)
    expect(isValidHttpUrl('not a url')).toBe(false)
    expect(isValidHttpUrl('')).toBe(false)
  })
})

describe('normalizeUnsubscribeLink', () => {
  it('retorna string vazia para entrada vazia', () => {
    expect(normalizeUnsubscribeLink('')).toBe('')
  })

  it('remove os brackets angulares do header', () => {
    expect(normalizeUnsubscribeLink('<https://example.com/unsub>')).toBe(
      'https://example.com/unsub',
    )
  })

  it('prioriza mailto quando presente', () => {
    const header = '<https://example.com/unsub>, <mailto:unsub@example.com>'
    expect(normalizeUnsubscribeLink(header)).toBe('mailto:unsub@example.com')
  })

  it('escolhe o primeiro http válido quando não há mailto', () => {
    const header = '<not-a-url>, <https://example.com/unsub>'
    expect(normalizeUnsubscribeLink(header)).toBe('https://example.com/unsub')
  })

  it('cai no primeiro candidato quando nenhum é http/mailto', () => {
    expect(normalizeUnsubscribeLink('<weird-scheme:foo>')).toBe('weird-scheme:foo')
  })
})
