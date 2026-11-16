<script module>
	import { tick } from 'svelte';
	export const row = 1;
</script>
{#snippet row()}<b>{tick}</b>{/snippet}
{@render row()}
