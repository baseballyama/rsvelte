<script lang="ts">
	import { onMount } from 'svelte';

	let count: number = 0;

	onMount(() => count++);
</script>
<div>{count}</div>
