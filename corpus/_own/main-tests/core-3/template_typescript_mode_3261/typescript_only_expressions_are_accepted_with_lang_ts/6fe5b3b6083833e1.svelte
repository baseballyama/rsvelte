<script lang="ts">
	let y = 1;
	let z = 2;
	function f() {}
	function sink() {}
	const fade = () => {};
</script>
{@html String((<T,>(a: T) => a)(1))}
