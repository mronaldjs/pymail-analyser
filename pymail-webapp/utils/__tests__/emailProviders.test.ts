import { describe, it, expect } from 'vitest'
import { inferIMAPHost, getProviderName } from '../emailProviders'

describe('emailProviders utils', () => {
  describe('inferIMAPHost', () => {
    it('should return correct imap host for gmail', () => {
      expect(inferIMAPHost('test@gmail.com')).toBe('imap.gmail.com')
    })

    it('should return correct imap host for outlook', () => {
      expect(inferIMAPHost('user@outlook.com')).toBe('imap-mail.outlook.com')
    })

    it('should return null for unknown domains', () => {
      expect(inferIMAPHost('user@unknown.com')).toBeNull()
    })

    it('should handle case-insensitivity', () => {
      expect(inferIMAPHost('USER@GMAIL.COM')).toBe('imap.gmail.com')
    })
  })

  describe('getProviderName', () => {
    it('should return Gmail for google accounts', () => {
      expect(getProviderName('test@gmail.com')).toBe('Gmail')
    })

    it('should return Gmail (UFG) for specific corporate domain', () => {
      expect(getProviderName('aluno@ufg.br')).toBe('Gmail (UFG)')
    })

    it('should return the domain itself if provider is not mapped', () => {
      expect(getProviderName('user@meudominio.com')).toBe('meudominio.com')
    })
  })
})
