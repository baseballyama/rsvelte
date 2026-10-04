<script lang="ts">
	import { type Snippet as File } from 'svelte';

	let { header }: { header?: File } = $props();
</script>

<p>{header ? 'with header' : 'no header'}</p>
