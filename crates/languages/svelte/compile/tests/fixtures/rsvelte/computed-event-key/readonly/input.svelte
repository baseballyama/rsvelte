<script lang="ts">
	import { createEventDispatcher } from "svelte";
	let { a }: { a: number } = $props();
	const GO = 'go';
	const d = createEventDispatcher<{ readonly [GO]: number }>();
</script>
