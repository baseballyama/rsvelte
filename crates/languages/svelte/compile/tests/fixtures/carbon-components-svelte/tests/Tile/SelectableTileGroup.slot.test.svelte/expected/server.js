import * as $ from 'svelte/internal/server';
import SelectableTileGroup from "carbon-components-svelte/Tile/SelectableTileGroup.svelte";

export default function SelectableTileGroup_slot_test($$renderer) {
	SelectableTileGroup($$renderer, {
		legendText: 'Default legend',
		$$slots: {
			legendChildren: ($$renderer) => {
				$$renderer.push(`<span slot="legendChildren">Custom legend content</span>`);
			}
		}
	});
}