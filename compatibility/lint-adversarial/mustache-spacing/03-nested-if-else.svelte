<script>
	let a = true;
	let b = false;
</script>

{#if a}
	{#if b}x{:else}y{/if}
{:else }
	z
{/if}
