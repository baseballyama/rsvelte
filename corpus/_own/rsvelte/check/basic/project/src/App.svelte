<script lang="ts">
	let { name }: { name: string } = $props();
	const shouted = name.toUpperCase();
</script>

<p>{shouted}</p>
