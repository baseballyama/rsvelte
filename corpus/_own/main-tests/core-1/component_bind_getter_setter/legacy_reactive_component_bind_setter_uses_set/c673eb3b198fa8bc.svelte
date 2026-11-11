<script>
  export let page;
  $: path = page.path;
</script>

<Tabs bind:selected={path} />