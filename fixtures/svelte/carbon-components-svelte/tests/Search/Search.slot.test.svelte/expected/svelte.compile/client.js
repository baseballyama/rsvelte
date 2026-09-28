import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Search from "carbon-components-svelte/Search/Search.svelte";

var root = $.from_html(`<span slot="labelChildren">Custom label content</span>`);

export default function Search_slot_test($$anchor) {
	Search($$anchor, {
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}