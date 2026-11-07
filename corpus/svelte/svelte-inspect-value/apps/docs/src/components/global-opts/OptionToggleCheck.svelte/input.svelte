<script lang="ts" generics="TKey extends keyof InspectOptions">
  import type { Snippet } from 'svelte'
  import type { InspectOptions } from 'svelte-inspect-value'
  import type { SvelteHTMLElements } from 'svelte/elements'
  import { globalOpts } from './globalopts.svelte'

  type OptionToggleProps = {
    children?: Snippet
    key: TKey
    disabled?: boolean
  } & SvelteHTMLElements['label']

  let { children, key, disabled, ...rest }: OptionToggleProps = $props()

  let checked = $derived(Boolean(globalOpts[key]))

  function onchange(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    ;(globalOpts[key] as unknown as boolean) = event.currentTarget.checked
  }
</script>

<label {...rest}>
  {@render children?.()}
  <input class="opt-tgl-chk" id={key} name={key} {disabled} type="checkbox" {checked} {onchange} />
</label>

<style>
  input {
    margin-right: 50px;
    border-radius: 4px;
    width: 1.5em;
    height: 1.5em;
  }

  label {
    transition: outline 200ms linear;
    outline: 0px solid transparent;
  }

  input:focus {
    outline: 1px solid var(--sl-color-accent);
    outline-offset: 1px;
  }

  /* label:focus-within {
    outline: 2px solid var(--sl-color-accent);
  } */

  :global(label:has(input.opt-tgl-chk.focused)) {
    transition: outline 200ms linear;
    outline: 2px solid var(--sl-color-accent);
  }
</style>
