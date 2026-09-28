<script lang="ts">
	import type { Snippet } from 'svelte';

	import { setComponentDialogCtx } from './component-dialog-context.svelte';

	let { children }: { children: Snippet } = $props();

	setComponentDialogCtx({});
</script>

{@render children()}
