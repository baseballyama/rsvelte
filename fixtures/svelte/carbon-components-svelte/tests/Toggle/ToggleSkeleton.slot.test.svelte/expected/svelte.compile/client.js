import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ToggleSkeleton from "carbon-components-svelte/Toggle/ToggleSkeleton.svelte";

var root = $.from_html(`<span slot="labelChildren">Custom label content</span>`);

export default function ToggleSkeleton_slot_test($$anchor) {
	ToggleSkeleton($$anchor, {
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}