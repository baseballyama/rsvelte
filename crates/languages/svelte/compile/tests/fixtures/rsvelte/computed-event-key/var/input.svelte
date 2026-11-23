<script lang="ts">
	import { createEventDispatcher } from "svelte";
	let { a }: { a: number } = $props();
	var GO = 1;
	var GO = 'go';
	const d = createEventDispatcher<{ [GO]: number }>();
</script>
