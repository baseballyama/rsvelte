<script lang="ts">
  import { backIn, backOut } from 'svelte/easing'
  import { useOptions } from '../../options.svelte.js'
  import rotate from '../../transition/rotate.js'

  const options = useOptions()

  type Props = {
    expand?: boolean
    setting?: 'collapsing' | 'expanding' | false
  }

  let { expand, setting }: Props = $props()
</script>

<svg viewBox="0 0 24 24" stroke-linecap="square" stroke-linejoin="round">
  <g fill="currentColor" stroke-width="2" stroke="currentColor">
    <!-- vert -->
    {#if expand}
      <path
        d="M 10 11 l 0 6"
        style="transform-box: fill-box"
        transform-origin="center"
        in:rotate={{
          rotation: 360,
          duration: options.transitionDuration * 3,
          easing: backOut,
        }}
        out:rotate={{
          rotation: 360,
          duration: options.transitionDuration * 3,
          easing: backIn,
        }}
      />
    {/if}
    <!-- horiz -->
    <path
      class={['minus', setting]}
      d="M 7 14 l 6 0"
      style="transform-box: fill-box"
      transform-origin="center"
    />
    <path
      fill="none"
      d="
        M 2, 20
        l 0 -12
        a 2 2 0 0 1 2 -2
        h 12
        a 2 2 0 0 1 2 2
        v 12
        a 2 2 0 0 1 -2 2
        h -12
        a 2 2 0 0 1 -2 -2
        z"
    />
    <!-- behindbox -->
    <path
      fill="none"
      d="
        M 6, 6
        l 0 -2
        a 2 2 0 0 1 2 -2
        h 12
        a 2 2 0 0 1 2 2
        v 12
        a 2 2 0 0 1 -2 2"
    />
  </g>
</svg>

<style>
  @keyframes spin {
    from {
      rotate: 0deg;
    }
    to {
      rotate: 360deg;
    }
  }

  .minus {
    rotate: 0deg;
    animation-duration: calc(var(--__transition-duration) * 1.8);
    animation-timing-function: linear;
  }

  .expanding {
    animation-delay: calc(var(--__transition-duration) * 3);
    animation-iteration-count: infinite;
    animation-name: spin;
  }

  .collapsing {
    /* animation-delay: calc(var(--__transition-duration) * 0.8); */
    animation-iteration-count: infinite;
    animation-direction: reverse;
    animation-name: spin;
  }
</style>
