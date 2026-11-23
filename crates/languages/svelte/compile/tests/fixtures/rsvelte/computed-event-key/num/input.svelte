<script lang="ts">
	import { createEventDispatcher } from "svelte";
	let { a }: { a: number } = $props();
	const GO = 1;
	const d = createEventDispatcher<{ [GO]: number }>();
</script>
