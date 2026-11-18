<script>
  let checked = false;
  let group = [];
  let el = null;
  let indeterminate = false;
  let files = null;
</script>

<input type="checkbox" bind:checked />
<input type="radio" bind:group />
<input type="checkbox" bind:this={el} />
<input type="checkbox" bind:indeterminate />
<input type="file" bind:files />
