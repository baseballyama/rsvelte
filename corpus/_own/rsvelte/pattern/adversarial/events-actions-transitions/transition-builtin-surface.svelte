<script>
  import {
    backOut,
    cubicInOut,
    elasticIn,
    linear,
    quintOut,
  } from "svelte/easing";
  import {
    blur,
    crossfade,
    draw,
    fade,
    fly,
    scale,
    slide,
  } from "svelte/transition";

  const [send, receive] = crossfade({ duration: 200, easing: quintOut });

  let on = $state(true);
  let key = $state(1);
</script>

{#if on}
  <div transition:fade={{ duration: 100, easing: linear }}>a</div>
  <div in:blur={{ amount: 4 }} out:blur>b</div>
  <div
    in:fly={{ x: 10, y: -10, opacity: 0.2, easing: cubicInOut }}
    out:fly={{ y: 5 }}
  >
    c
  </div>
  <div transition:slide={{ axis: "x", duration: 50 }}>d</div>
  <div transition:scale={{ start: 0.5, easing: elasticIn }}>e</div>
  <div in:receive={{ key }} out:send={{ key }}>f</div>
  <svg viewBox="0 0 10 10">
    <path
      d="M0 0 L10 10"
      transition:draw={{ duration: 100, easing: backOut }}
    />
  </svg>
{/if}

<button onclick={() => (on = !on)}>{key}</button>
