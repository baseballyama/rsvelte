<script lang="ts">
  import Child from './Child.svelte';
  let open = $state(false);
</script>
<Child bind:expanded={() => open, (v: boolean) => { open = v; }} />
