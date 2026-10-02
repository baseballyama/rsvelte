import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TileGroup from "carbon-components-svelte/Tile/TileGroup.svelte";

var root = $.from_html(`<span slot="legendChildren">Custom legend content</span>`);

export default function TileGroup_slot_test($$anchor) {
	TileGroup($$anchor, {
		legendText: 'Default legend',
		$$slots: {
			legendChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}