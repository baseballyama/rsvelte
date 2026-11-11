<script lang="ts">
	let y = 1;
	let z = 2;
	function f() {}
	function sink() {}
	const fade = () => {};
</script>
<button onclick={() => sink(((a: string) => a)(""))}>x</button>
