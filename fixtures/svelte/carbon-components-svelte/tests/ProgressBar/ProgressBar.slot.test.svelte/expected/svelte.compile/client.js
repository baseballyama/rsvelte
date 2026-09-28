import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ProgressBar from "carbon-components-svelte/ProgressBar/ProgressBar.svelte";

var root = $.from_html(`<span slot="labelChildren">Custom label content</span>`);

export default function ProgressBar_slot_test($$anchor) {
	ProgressBar($$anchor, {
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}