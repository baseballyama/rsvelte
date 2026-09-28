import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Dialog, Stack } from "carbon-components-svelte";

var root = $.from_html(`<p>This dialog has no backdrop. The page behind it stays interactive.</p> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Dialog_1($$anchor) {
	let open = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Open dialog');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Dialog(node_1, {
		'aria-label': 'Example dialog',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				gap: 5,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.sibling($.first_child(fragment_2), 2);

					Button(node_2, {
						$$events: { click: () => open = false },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Close');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}