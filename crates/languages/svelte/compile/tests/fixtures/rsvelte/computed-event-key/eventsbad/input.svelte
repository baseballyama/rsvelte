<script lang="ts">
	import { createEventDispatcher } from "svelte";
	let { a }: { a: number } = $props();
	const GO = 1;
	interface $$Events { [GO]: CustomEvent<number> }
</script>
