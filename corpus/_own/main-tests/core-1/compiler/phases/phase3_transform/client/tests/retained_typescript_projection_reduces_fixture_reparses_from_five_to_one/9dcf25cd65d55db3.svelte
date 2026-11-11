<script module lang="ts">
	export const K = 1;
</script>
<script>
	const p = { m: 1 } satisfies Record<string, number>;
	let count = $state(0);
</script>
<button onclick={() => count++}>{count}{p.m}</button>