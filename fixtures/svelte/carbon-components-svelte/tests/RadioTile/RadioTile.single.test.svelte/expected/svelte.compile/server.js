import * as $ from 'svelte/internal/server';
import RadioTile from "carbon-components-svelte/Tile/RadioTile.svelte";

export default function RadioTile_single_test($$renderer) {
	RadioTile($$renderer, {
		name: 'custom-name',
		value: 'test',
		children: ($$renderer) => {
			$$renderer.push(`<div>Custom content</div>`);
		},
		$$slots: { default: true }
	});
}