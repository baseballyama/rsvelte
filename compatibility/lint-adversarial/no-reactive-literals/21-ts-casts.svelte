<script lang="ts">
	let a: string;
	let b: string;
	let c: readonly never[];
	$: a = 'plain' as string;
	$: b = <string>'angle';
	$: c = [] as const;
</script>

{a}{b}{c.length}
