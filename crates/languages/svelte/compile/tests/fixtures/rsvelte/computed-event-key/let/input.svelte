<script lang="ts">
	import { createEventDispatcher } from "svelte";
	let { a }: { a: number } = $props();
	let GO = 'go';
	const d = createEventDispatcher<{ [GO]: number }>();
</script>
