<script lang="ts">
  import ToggleButton from './ToggleButton.svelte';

  let { isRTL = $bindable() }: { isRTL: boolean } = $props();

  function clicked() {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }
</script>

<div class="input-output-toggle">
  Direction:
  <span aria-hidden="true">LTR</span>
  <ToggleButton bind:pressed={isRTL} label="RTL direction" onclick={clicked} />
  <span aria-hidden="true">RTL</span>
</div>

<style>
  .input-output-toggle {
    position: relative;
    display: flex;
    gap: 0.5em;
    user-select: none;
    align-items: center;
    width: 100%;
    height: 20px;
    margin: 0 auto;
    padding: 10px;
  }
</style>
