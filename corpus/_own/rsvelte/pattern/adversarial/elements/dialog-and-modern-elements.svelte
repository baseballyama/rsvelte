<script>
	let dialog = $state(null);
	let query = $state('');
</script>

<dialog bind:this={dialog} closedby="any">
	<form method="dialog">
		<button value="ok">close</button>
	</form>
</dialog>

<search>
	<input type="search" bind:value={query} results="5" />
</search>

<hgroup>
	<h1>title</h1>
	<p>subtitle</p>
</hgroup>

<figure>
	<slot name="media" />
	<figcaption>cap {query}</figcaption>
</figure>

<button commandfor="d" command="show-modal" onclick={() => dialog?.showModal()}>open</button>
