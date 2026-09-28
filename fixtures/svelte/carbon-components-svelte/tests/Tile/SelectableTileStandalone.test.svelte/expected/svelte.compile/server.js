import * as $ from 'svelte/internal/server';
import SelectableTile from "carbon-components-svelte/Tile/SelectableTile.svelte";

export default function SelectableTileStandalone_test($$renderer) {
	SelectableTile($$renderer, {
		value: 'standalone-value',
		name: 'solo',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Standalone`);
		},
		$$slots: { default: true }
	});
}