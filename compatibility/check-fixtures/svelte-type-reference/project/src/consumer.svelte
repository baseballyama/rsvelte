<script lang="ts">
	import type { Cookies } from '@sveltejs/kit';
	import Box from './box.svelte';

	let { cookies }: { cookies: Cookies } = $props();
</script>

{#snippet heading()}
	<em>{cookies.get('name')}</em>
{/snippet}

<Box title={heading}>
	<p>body</p>
</Box>
