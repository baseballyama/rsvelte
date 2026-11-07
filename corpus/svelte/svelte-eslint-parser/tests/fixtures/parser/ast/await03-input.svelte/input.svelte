<script>
let expression = new Promise()
</script>

{#await expression}{:then}{:catch}{/await}

{#await expression}{:then}{/await}

{#await expression}{:catch}{/await}
