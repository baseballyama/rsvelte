<script lang="ts">
  import type { SvelteHTMLElements } from 'svelte/elements'
  import { scale } from 'svelte/transition'
  import { flash as flashOnUpdate } from '../attachments/update-flash.svelte.js'
  import { useOptions } from '../options.svelte.js'
  import Bullet from './Bullet.svelte'
  import Caret from './icons/Caret.svelte'

  type Props = {
    collapsed?: boolean
    onchange?: (collapsed: boolean) => void
    value: unknown
    key?: string | symbol | number
    type?: string
    disabled?: boolean
  } & SvelteHTMLElements['div']

  let { collapsed = $bindable(), onchange, disabled, value, key, type, ...rest }: Props = $props()

  let flashing = $state(false)
  let childflash = $state(false)

  let options = useOptions()

  let rotation = $derived.by(() => {
    if (collapsed) return 0
    return 90
  })

  export function flash() {
    if (childflash) return
    childflash = true
    window.setTimeout(() => {
      childflash = false
    }, options.flashDuration)
  }

  export function flashButton() {
    if (flashing) return
    flashing = true
    window.setTimeout(() => {
      flashing = false
    }, options.flashDuration)
  }

  let keyOrType = $derived((key ?? type)?.toString())
</script>

<div
  style:--flash-duration={options.flashDuration}
  data-testid="collapse-button"
  class={['collapse', flashing && 'flashing', childflash && 'child-flash']}
  aria-label={`${collapsed ? 'expand' : 'collapse'} ${keyOrType}`}
  {...rest}
>
  {#if disabled}
    <Bullet />
  {:else}
    <div class="caret-transition" in:scale={{ duration: options.transitionDuration }}>
      <Caret
        style="rotate:{rotation}deg;
        transition: rotate var(--__transition-duration) var(--_back-out);
        width: 100%; height: 100%;"
        {@attach flashOnUpdate(() => value, flashButton, options.value.flashOnUpdate)}
      />
    </div>
  {/if}
</div>

<style>
  .collapse {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    transition-duration: var(--__transition-duration);
    transition-property: color, rotate, transform, filter;
    transition-timing-function: var(--_back-out);
    aspect-ratio: 1 / 1;
    width: 1em;
    min-width: 1em;
    max-width: 1em;
    height: 1em;
    overflow: visible;
    color: var(--_caret-color);
    user-select: none;

    &:hover {
      background-color: transparent;
      color: var(--_caret-hover-color);
    }

    &:focus {
      color: var(--_caret-focus-color);
    }

    &.flashing {
      transform: scale(1.2, 1.2);
      filter: drop-shadow(0px 0px 2px var(--_update-flash-color));
      transition-duration: var(--flash-duration);
      color: var(--_update-flash-color);
    }

    &.child-flash {
      transition-duration: var(--flash-duration);
      color: var(--_child-update-flash-color);
    }

    .caret-transition {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
    }
  }
</style>
