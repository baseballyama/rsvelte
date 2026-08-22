<script>
  /* eslint svelte/no-inline-styles: ["warn", { "allowTransitions": false }] */
  import { fade, fly } from 'svelte/transition';
  let show = true;
</script>

{#if show}
  <div transition:fade>flag transition</div>
  <div transition:fade|local={{ duration: 1 }}>flag with modifier</div>
  <div in:fly={{ y: 10 }}>in directive — kind?</div>
  <div out:fade>out directive — kind?</div>
{/if}
