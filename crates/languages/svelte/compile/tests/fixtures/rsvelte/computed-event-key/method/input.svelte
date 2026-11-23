<script lang="ts">
	import { createEventDispatcher } from "svelte";
	let { a }: { a: number } = $props();
	const d = createEventDispatcher<{ [Z](): void; go: number }>();
</script>
