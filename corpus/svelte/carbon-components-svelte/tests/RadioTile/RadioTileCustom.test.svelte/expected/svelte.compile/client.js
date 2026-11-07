import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RadioTile from "carbon-components-svelte/Tile/RadioTile.svelte";
import TileGroup from "carbon-components-svelte/Tile/TileGroup.svelte";

var root = $.from_html(`<div>Custom content</div>`);

export default function RadioTileCustom_test($$anchor) {
	TileGroup($$anchor, {
		legendText: 'Test group',
		name: 'test-group',
		selected: 'test',
		children: ($$anchor, $$slotProps) => {
			RadioTile($$anchor, {
				value: 'test',
				children: ($$anchor, $$slotProps) => {
					var div = root();

					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}