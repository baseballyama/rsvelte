<script lang="ts">
	import { createEventDispatcher } from "svelte";
	let { a }: { a: number } = $props();
	const K = { go: 'go' };
	const d = createEventDispatcher<{ [K.go]: number }>();
</script>
