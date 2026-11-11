<script>
  import { fade, fly } from 'svelte/transition';
  let show = true;
</script>

{#if show}
  <div transition:fade>default allows transitions</div>
  <div in:fly={{ y: 10 }}>in directive</div>
  <div out:fade>out directive</div>
{/if}
