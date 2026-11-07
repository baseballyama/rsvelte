import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Dialog, Stack } from "carbon-components-svelte";

var root = $.from_html(`<p>Dialog content.</p> <form method="dialog"><!></form>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function ModalDialog($$anchor) {
	let open = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Open modal dialog');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Dialog(node_1, {
		modal: true,
		'aria-label': 'Example modal dialog',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		$$events: {
			open: () => console.log("open"),
			close: (e) => console.log("close", e.detail)
		},

		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				gap: 5,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var form = $.sibling($.first_child(fragment_2), 2);
					var node_2 = $.child(form);

					Button(node_2, {
						type: 'submit',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Close');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.reset(form);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}