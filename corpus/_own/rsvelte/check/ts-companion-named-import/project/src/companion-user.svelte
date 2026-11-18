<script lang="ts">
	import Widget from '$lib/widget.svelte';
	import { helper } from './lib/widget.svelte.js';
</script>

<Widget label={String(helper())} />
