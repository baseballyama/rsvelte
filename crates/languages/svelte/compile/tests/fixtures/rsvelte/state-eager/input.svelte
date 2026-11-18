<script>
	let props = $props();
	let n = $state(0);
	const value = $derived(props.number ?? 0);
	const e = $state.eager(n);
	function f() { return $state.eager(n) + 1; }
</script>
<div>value={value}</div>
<div>eager={$state.eager(value)}</div>
<button onclick={() => n++}>{e}{f()}{$state.eager(n)}</button>
