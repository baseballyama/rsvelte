import * as $ from 'svelte/internal/server';
import TileGroup from "carbon-components-svelte/Tile/TileGroup.svelte";

export default function TileGroup_slot_test($$renderer) {
	TileGroup($$renderer, {
		legendText: 'Default legend',
		$$slots: {
			legendChildren: ($$renderer) => {
				$$renderer.push(`<span slot="legendChildren">Custom legend content</span>`);
			}
		}
	});
}