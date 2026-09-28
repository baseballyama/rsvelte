<script lang="ts">
  import type { ValueType } from '../util.js'
  import Highlight from './Highlight.svelte'

  type Props = {
    length: number
    type?: ValueType | string
  }

  let { length, type }: Props = $props()

  let prefix = $derived.by(() => {
    switch (type) {
      case 'urlsearchparams':
        return 'size:'
      default:
        return ''
    }
  })

  let unit = $derived.by(() => {
    switch (type) {
      case undefined:
        return
      case 'urlsearchparams':
        return
      case 'array':
      case 'int8array':
      case 'uint8array':
      case 'uint8clampedarray':
      case 'int16array':
      case 'uint16array':
      case 'int32array':
      case 'uint32array':
      case 'float32array':
      case 'float64array':
      case 'bigint64array':
      case 'biguint64array':
        return 'items'
      case 'string':
        return 'chars'
      default:
        return 'entries'
    }
  })
</script>

{#if typeof length === 'number'}
  <div data-testid="count" class="count">
    {#if length > 0}
      {#if prefix}
        <span class="unit">{prefix}</span>
      {/if}
      <span>
        {length}
      </span>
      {#if unit}
        <Highlight class="unit" value={unit} fields={['value']} />
      {/if}
    {:else}
      <Highlight value="empty" fields={['value']} />
    {/if}
  </div>
{/if}

<style>
  .count {
    display: flex;
    gap: 0.5ch;
    transition: color var(--__transition-duration) ease-in-out;
    margin-right: 1ch;
    color: var(--_length-color);
    font-style: italic;
    font-weight: bold;
    font-size: 0.857em;
  }

  :global(.count .unit) {
    display: var(--unit-display);
  }
</style>
