<script lang="ts">
	let a: unknown;
	let b: unknown;
	$: a = [] as const;
	$: b = 'x' as string;
</script>

{a}{b}
