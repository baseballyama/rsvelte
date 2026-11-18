<script lang="ts">
	let { p = 1 }: { p?: number } = $props();
	let n = $state(0);
</script>

<b onclick={() => n++}>{n}{p}</b>
