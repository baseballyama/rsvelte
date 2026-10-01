<script>
  let name = $state('world');
  let shout = $derived(name.toUpperCase());
</script>

<label>Name <input class="name" bind:value={name} /></label>
<p class="greeting">Hello, {name}!</p>
<p class="shout">{shout} ({name.length})</p>
