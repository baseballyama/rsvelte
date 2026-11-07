<script>
let expression = new Promise()
</script>

{#await expression catch}
	<p>oh no! Something broke!</p>
{/await}

{#await expression then}
	<p>the promise is resolved</p>
{:catch theError}
	<p>oh no! {theError.message}</p>
{/await}

{#await expression then}
	<p>the promise is resolved</p>
{/await}
