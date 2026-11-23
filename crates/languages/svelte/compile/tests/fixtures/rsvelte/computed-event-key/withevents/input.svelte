<script lang="ts">
	import { createEventDispatcher } from "svelte";
	let { a }: { a: number } = $props();
	interface $$Events { go: CustomEvent<number> }
	const d = createEventDispatcher<{ [Z]: number }>();
</script>
