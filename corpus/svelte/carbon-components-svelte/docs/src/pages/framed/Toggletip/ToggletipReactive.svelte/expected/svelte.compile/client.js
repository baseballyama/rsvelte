import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Stack, Toggletip } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function ToggletipReactive($$anchor) {
	let open = true;

	Stack($$anchor, {
		gap: 12,
		align: 'start',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Toggletip(node, {
				labelText: 'Resource list',
				align: 'start',
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Resources are provisioned based on your account\'s organization.');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				kind: 'tertiary',
				size: 'small',
				$$events: { click: () => open = !open },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, open ? "Close toggletip" : "Open toggletip"));
					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}