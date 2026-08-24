<script>
  import {
    fade,
    fly,
    slide,
    scale,
    blur,
    draw,
    crossfade,
  } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { cubicOut } from "svelte/easing";

  let show = $state(true);
  let rows = $state([1, 2]);
  const [send, receive] = crossfade({ duration: 100 });
</script>

{#if show}
  <div transition:fade>a</div>
  <div transition:fade={{ duration: 100 }}>b</div>
  <div in:fly={{ y: 10, easing: cubicOut }} out:slide|local>c</div>
  <div in:scale|global={{ start: 0.5 }}>d</div>
  <div transition:blur={{ amount: 2 }}>e</div>
  <svg><path d="M0 0" transition:draw={{ duration: 50 }} /></svg>
{/if}

{#each rows as row (row)}
  <div
    animate:flip={{ duration: 100 }}
    in:receive={{ key: row }}
    out:send={{ key: row }}
  >
    {row}
  </div>
{/each}

<button onclick={() => (show = !show)}>t</button>
