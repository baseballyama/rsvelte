import * as $ from 'svelte/internal/server';
import RadioTile from "carbon-components-svelte/Tile/RadioTile.svelte";

export default function RadioTileStandalone_test($$renderer) {
	RadioTile($$renderer, {
		value: 'standalone-value',
		name: 'solo',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Standalone`);
		},
		$$slots: { default: true }
	});
}