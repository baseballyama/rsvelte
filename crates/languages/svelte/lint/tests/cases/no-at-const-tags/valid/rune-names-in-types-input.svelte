<script lang="ts">
	let a: $state;
	function f(): $derived {}
	let b = f<$effect>();
	let c: typeof $props;
</script>

{#if a}
	{@const x = 1}
	{x}
{/if}
