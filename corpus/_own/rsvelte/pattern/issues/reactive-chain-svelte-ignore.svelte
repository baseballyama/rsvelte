<script>
	import { client } from "./client.js";

	let ids = [];

	$: void client
		.findAll()
		// svelte-ignore state_referenced_locally
		.then((res) => {
			ids = res;
		});

	let pending = false;
</script>

<span>{ids.length}{pending}</span>
