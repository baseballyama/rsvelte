import { getContext, setContext } from 'svelte'
import { focusBySearch } from './attachments/focus.js'

/*
 * Adapted from https://github.com/trbrc/svelte-inspect
 */

export class TypingBuffer {
  typingBuffer = $state('')
  hasSearchBufferTimeout = false
  clearBufferTimeout: number | undefined

  constructor(private scopeId: string) {}

  type(char: string) {
    this.typingBuffer += char
    if (!this.hasSearchBufferTimeout) {
      this.hasSearchBufferTimeout = true
      setTimeout(() => {
        this.hasSearchBufferTimeout = false
        focusBySearch(this.typingBuffer, this.scopeId)
      }, 100)
    }
    window.clearTimeout(this.clearBufferTimeout)
    this.clearBufferTimeout = window.setTimeout(() => {
      this.typingBuffer = ''
    }, 600)
  }

  get current() {
    return this.typingBuffer
  }
}

const TYPING_BUFFER_CONTEXT = Symbol('siv.typing-buffer')

export function createTypingBufferContext(scopeId: string) {
  return setContext(TYPING_BUFFER_CONTEXT, new TypingBuffer(scopeId))
}

export function getTypingBuffer(): TypingBuffer {
  return getContext(TYPING_BUFFER_CONTEXT)
}
