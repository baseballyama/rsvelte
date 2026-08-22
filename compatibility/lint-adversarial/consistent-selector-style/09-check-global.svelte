<script>
  /* eslint svelte/consistent-selector-style: ["warn", { "checkGlobal": true }] */
</script>

<a class="ext" href="/x">anchor</a>

<style>
  :global(.ext) {
    color: red;
  }
</style>
