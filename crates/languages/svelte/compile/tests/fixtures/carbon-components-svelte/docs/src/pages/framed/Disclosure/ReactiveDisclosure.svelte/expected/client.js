import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Disclosure, Stack } from "carbon-components-svelte";

var root = $.from_html(`<p>Orders ship within 2 business days and arrive in 3-5 business days.</p>`);
var root_1 = $.from_html(`<div>Open: <strong> </strong></div> <!>`, 1);

export default function ReactiveDisclosure($$anchor) {
	let open = false;

	Stack($$anchor, {
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var strong = $.sibling($.child(div));
			var text = $.only_child(strong, true);

			$.reset(div);

			var node = $.sibling(div, 2);

			Disclosure(node, {
				summary: 'Show shipping details',
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
				},
				$$events: { toggle: (e) => console.log("toggle", e.detail) },
				children: ($$anchor, $$slotProps) => {
					var p = root();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			$.template_effect(() => $.set_text(text, open));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}