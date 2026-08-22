<script lang="ts">
	const cast = 'x' as const;
	const sat = { a: 1 } satisfies object;
	const bang = null!;
</script>

<button onclick={cast}>1</button>
<button onclick={sat}>2</button>
<button onclick={'y' as unknown}>3</button>
<button onclick={bang}>4</button>
