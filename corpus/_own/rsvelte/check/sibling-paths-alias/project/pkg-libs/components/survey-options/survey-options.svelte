<script module lang="ts">
	export type WithOther<T extends string> = T | `OTHER: ${string}`;
</script>

<script lang="ts">
	let { id }: { id: string } = $props();
</script>

<div>{id}</div>
