import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from "carbon-components-svelte/Checkbox/Checkbox.svelte";

var root = $.from_html(`<span slot="labelChildren" data-testid="custom-label">Custom label content</span>`);

export default function Checkbox_slot_test($$anchor) {
	Checkbox($$anchor, {
		'data-testid': 'checkbox-slot',
		$$slots: {
			labelChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}