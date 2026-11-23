<script lang="ts">
	import { createEventDispatcher } from "svelte";
	let { a }: { a: number } = $props();
	interface $$Events { go: CustomEvent<number> }
	type $$Events = { [Z]: CustomEvent<number> };
</script>
