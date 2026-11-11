<svelte:options runes={false} />

<script lang="ts">
	let { title }: { title: string } = $props();
</script>
<h1>{title}</h1>
<slot />
