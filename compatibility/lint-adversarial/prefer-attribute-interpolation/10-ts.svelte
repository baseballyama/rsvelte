<script lang="ts">
	let b: number = 2;
	let tag = (s: TemplateStringsArray, ...v: unknown[]) => '';
</script>

<div data-x={`v${b}` as string}>1</div>
<div data-x={`v${b as number}`}>2</div>
<div data-x={tag`v${b}`}>3</div>
