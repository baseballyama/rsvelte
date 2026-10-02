import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RadioTile from "carbon-components-svelte/Tile/RadioTile.svelte";

var root = $.from_html(`<div>Custom content</div>`);

export default function RadioTile_single_test($$anchor) {
	RadioTile($$anchor, {
		name: 'custom-name',
		value: 'test',
		children: ($$anchor, $$slotProps) => {
			var div = root();

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}