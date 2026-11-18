<script lang="ts">
	export let count: number;
	let fn: unknown;
	$: fn = (() => count) as unknown;
	$: fn = <unknown>(() => count);
</script>

{count}
