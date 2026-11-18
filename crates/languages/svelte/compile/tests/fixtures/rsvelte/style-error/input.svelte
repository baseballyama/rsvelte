<script lang="ts">
	let count: number = 'zero';
	let { title }: { title: string } = $props();
</script>

<h1>{title.toFixed()}</h1>

<style>
	h1 { color: red;
</style>
