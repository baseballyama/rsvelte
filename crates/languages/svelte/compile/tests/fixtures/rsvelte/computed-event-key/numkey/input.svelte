<script lang="ts">
	import { createEventDispatcher } from "svelte";
	let { a }: { a: number } = $props();
	const d = createEventDispatcher<{ 1: number }>();
</script>
