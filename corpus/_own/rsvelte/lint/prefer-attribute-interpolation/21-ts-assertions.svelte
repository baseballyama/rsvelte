<script lang="ts">
	let b: number | null = 2;
</script>

<div data-a={`v${b!}`}>1</div>
<div data-b={`v${b satisfies number | null}`}>2</div>
<div data-c={`v${(b as number) + 1}`}>3</div>
