<script lang="ts">
	const list = [1, 2];
</script>

<input
	{...list} />
<a href="x" {...list} title="t">x</a>
<svelte:element this="b" {...list}>x</svelte:element>
<x-café {...list}></x-café>
