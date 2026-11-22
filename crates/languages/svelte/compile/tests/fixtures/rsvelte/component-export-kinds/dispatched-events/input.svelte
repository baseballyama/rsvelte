<script lang="ts">
	import { createEventDispatcher } from "svelte";
	const d = createEventDispatcher();
	let { a }: { a: number } = $props();
	d("go", 1);
</script>
<p>{a}</p>
