<script lang="ts">
	let { vars }: { vars: Record<string, Record<string, string>> } = $props();
	let mode = { current: 'light' };
</script>

<div style="--color: {vars?.[mode.current as 'light' | 'dark']?.['muted-foreground']}"></div>
<p>{vars as unknown as string}</p>
