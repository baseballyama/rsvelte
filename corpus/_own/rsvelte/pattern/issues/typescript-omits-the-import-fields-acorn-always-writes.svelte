<script module lang="ts">
	export { helper } from './helpers.js' with { type: 'json' };
	export { plain } from './plain.js';
</script>

<script lang="ts">
	import data from './data.json' with { type: 'json' };
	import bare from './bare.js';
	import type { Shape } from './shape.js';

	const lazy = import('./lazy.js', { with: { type: 'json' } });
	const lazyBare = import('./lazyBare.js');

	export let x: Shape[] = [data, bare, lazy, lazyBare] as Shape[];
</script>

{x.length}
