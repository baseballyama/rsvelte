import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RadioTile from "carbon-components-svelte/Tile/RadioTile.svelte";

export default function RadioTileStandalone_test($$anchor) {
	RadioTile($$anchor, {
		value: 'standalone-value',
		name: 'solo',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Standalone');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}