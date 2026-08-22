<script>
	export let logger = console.log;
	let n = 0;
</script>

<form on:submit|preventDefault={() => logger(n)}>
	<button on:click|stopPropagation|once={() => (n += 1)}>once</button>
	<button on:click|capture|self={() => (n += 2)} type="button">capture</button>
	<input on:keydown|trusted={(e) => logger(e.key)} on:wheel|passive={() => {}} />
	<div on:scroll|nonpassive={() => {}} on:click on:custom-event={() => logger('c')}>
		{n}
	</div>
</form>
