<script>
	import { client } from "./client.js";

	let ids = [];

	$: void client
		.findAll()
		// plain
		.then((res) => {
			ids = res;
		});

	let pending = false;
</script>

<span>{ids.length}{pending}</span>
