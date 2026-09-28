import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SelectableTile from "carbon-components-svelte/Tile/SelectableTile.svelte";

export default function SelectableTileStandalone_test($$anchor) {
	SelectableTile($$anchor, {
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