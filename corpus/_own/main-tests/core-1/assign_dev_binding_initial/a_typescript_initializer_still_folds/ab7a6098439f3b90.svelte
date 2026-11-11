<script lang="ts">
	let o = $state({});
	const g: number = 1;
	function f() { o.a = o.b = g; }
</script>
<button onclick={f}>x</button>
