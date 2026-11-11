<script module>
	export { helper } from './helpers.js' with { type: 'json' };
	export { plain } from './plain.js';
</script>

<script>
	import data from './data.json' with { type: 'json' };
	import styled from './styled.json' with { 'type': "json", other: 'x' };
	import bare from './bare.js';

	const lazy = import('./lazy.js', { with: { type: 'json' } });
	const lazyBare = import('./lazyBare.js');

	export let x = [data, styled, bare, lazy, lazyBare];
</script>

{x.length}
