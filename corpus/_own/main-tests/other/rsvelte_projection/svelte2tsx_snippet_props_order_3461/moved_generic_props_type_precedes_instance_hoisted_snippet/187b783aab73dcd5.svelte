<script lang="ts" generics="T">
	let { prop }: { prop?: T } = $props();
	const promise = Promise.resolve();
</script>

{#snippet row()}<i>{await promise}</i>{/snippet}
{@render row()}
