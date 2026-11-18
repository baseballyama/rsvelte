<script lang="ts">
	let { label }: { label: string } = $props();
	const count: number = 'not a number';
</script>

<div>{label}{count}</div>

<style>
	.never-used {
		color: red;
	}
</style>
