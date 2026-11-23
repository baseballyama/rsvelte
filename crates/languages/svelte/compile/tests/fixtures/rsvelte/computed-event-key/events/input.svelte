<script lang="ts">
	import { createEventDispatcher } from "svelte";
	let { a }: { a: number } = $props();
	const GO = 'go';
	interface $$Events { [GO]: CustomEvent<number> }
</script>
