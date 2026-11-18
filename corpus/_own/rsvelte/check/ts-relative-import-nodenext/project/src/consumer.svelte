<script lang="ts">
	import List from './lib/anatomy/list.svelte';
	import type { ArrowProps } from './lib/anatomy/arrow.svelte';
	import { useProvider } from './lib/modules/provider.svelte';
	import theme, { tokens } from './lib/modules/theme.svelte';

	const rows: ArrowProps[] = [useProvider()];
</script>

<List {rows} />
<p>{theme.name}{tokens.length}</p>
