<script lang="ts">
	function f(a: number): number { return a + 1; }
	let count = $state(0);
	const r = f(1);
</script>
<button onclick={() => count++}>{r}{count}</button>