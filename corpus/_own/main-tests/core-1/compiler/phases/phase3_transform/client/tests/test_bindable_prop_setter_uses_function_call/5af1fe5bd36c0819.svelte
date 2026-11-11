<script>
  import Child from './Child.svelte';
  let { value = $bindable() } = $props();
</script>
<Child bind:value />