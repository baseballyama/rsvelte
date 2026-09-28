<script lang="ts">
  import { flash } from '../attachments/update-flash.svelte.js'
  import { useOptions } from '../options.svelte.js'

  let { value = undefined } = $props()

  let flashing = $state(false)
  let options = useOptions()
  const { flashOnUpdate, noanimate } = $derived(options.value)

  export function flashBullet(): void {
    if (flashing) return
    flashing = true
    window.setTimeout(() => {
      flashing = false
    }, options.flashDuration)
  }
</script>

<div class="bullet" role="presentation">
  <div
    aria-hidden={true}
    class="dash"
    class:flashing
    class:noanimate
    {@attach flash(() => value, flashBullet, flashOnUpdate)}
  ></div>
</div>

<style>
  .bullet {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    align-items: center;
    aspect-ratio: 1 / 1;
    width: 1em;
    min-width: 1em;
    max-width: 1em;
    height: 1em;
    user-select: none;

    .dash {
      transition-duration: var(--__transition-duration);
      transition-property: width, height, border-radius, background-color, transform;
      transition-timing-function: var(--_back-out);
      border-radius: 0px;
      background-color: var(--_bullet-color);
      width: 4px;
      height: 1px;
      overflow: visible;

      &.flashing {
        transform: translateX(1%) scale(1, 1) rotate(-10deg);
        filter: drop-shadow(0px 0px 2px var(--_update-flash-color));
        border-radius: 9999px;
        background-color: var(--_update-flash-color);
        width: 4px;
        height: 4px;
      }

      &.flashing.noanimate {
        transform: translateX(1%) scale(1, 1) rotate(2turn);
        filter: drop-shadow(0px 0px 2px var(--_update-flash-color));
        border: 1px solid var(--_update-flash-color);
        background-color: var(--_update-flash-color) !important;
        width: 4px !important;
        height: 4px !important;
      }
    }
  }
</style>
