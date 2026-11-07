import * as $ from 'svelte/internal/server';
import RadioTile from "carbon-components-svelte/Tile/RadioTile.svelte";
import TileGroup from "carbon-components-svelte/Tile/TileGroup.svelte";

export default function RadioTileCustom_test($$renderer) {
	TileGroup($$renderer, {
		legendText: 'Test group',
		name: 'test-group',
		selected: 'test',
		children: ($$renderer) => {
			RadioTile($$renderer, {
				value: 'test',
				children: ($$renderer) => {
					$$renderer.push(`<div>Custom content</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}