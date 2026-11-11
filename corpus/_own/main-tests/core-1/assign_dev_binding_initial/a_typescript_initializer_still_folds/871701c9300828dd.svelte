<script lang="ts">
	let o = $state({});
	const g = 1 as number;
	function f() { o.a = o.b = g; }
</script>
<button onclick={f}>x</button>
