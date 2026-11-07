import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Header from "carbon-components-svelte/UIShell/Header.svelte";

var root = $.from_html(`<span slot="company">Custom company content</span>`);

export default function Header_slot_test($$anchor) {
	Header($$anchor, {
		companyName: 'Default company',
		$$slots: {
			company: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}