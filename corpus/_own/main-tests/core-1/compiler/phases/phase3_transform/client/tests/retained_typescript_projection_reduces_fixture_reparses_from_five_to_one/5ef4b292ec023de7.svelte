<script lang="ts">
	function f(a: boolean): boolean;
	function f(a: string): number;
	function f(a: any): any { return a; }
	let count = $state(0);
	const r = f(true);
</script>
<button onclick={() => count++}>{r}{count}</button>