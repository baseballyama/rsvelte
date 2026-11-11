<script lang="ts">
	let y = 1;
	let z = 2;
	function f() {}
	function sink() {}
	const fade = () => {};
</script>
{#if y as unknown as string}<p>x</p>{/if}
