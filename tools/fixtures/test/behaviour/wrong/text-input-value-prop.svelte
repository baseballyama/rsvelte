<script>
  let name = $state('world');
  let shout = $derived(name.toUpperCase());
</script>

<label>Name <input class="name" value={name.toUpperCase()} oninput={(e) => (name = e.currentTarget.value)} /></label>
<p class="greeting">Hello, {name}!</p>
<p class="shout">{shout} ({name.length})</p>
