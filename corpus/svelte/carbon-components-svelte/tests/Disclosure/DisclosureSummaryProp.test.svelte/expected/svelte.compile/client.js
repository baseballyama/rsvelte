import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Disclosure from "carbon-components-svelte/Disclosure/Disclosure.svelte";

var root = $.from_html(`<p>Hidden content</p>`);

export default function DisclosureSummaryProp_test($$anchor) {
	Disclosure($$anchor, {
		summary: 'Show details',
		children: ($$anchor, $$slotProps) => {
			var p = root();

			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});
}