import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SelectableTileGroup from "carbon-components-svelte/Tile/SelectableTileGroup.svelte";

var root = $.from_html(`<span slot="legendChildren">Custom legend content</span>`);

export default function SelectableTileGroup_slot_test($$anchor) {
	SelectableTileGroup($$anchor, {
		legendText: 'Default legend',
		$$slots: {
			legendChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}