import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Stack, Tooltip } from "carbon-components-svelte";

var root = $.from_html(`<p>Resources are provisioned based on your account's organization.</p>`);
var root_1 = $.from_html(`<!> <div><!></div>`, 1);

export default function TooltipReactive($$anchor) {
	let open = true;

	Stack($$anchor, {
		gap: 12,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Tooltip(node, {
				triggerText: 'Resource list',
				align: 'start',
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var p = root();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node, 2);
			var node_1 = $.child(div);

			Button(node_1, {
				kind: 'tertiary',
				size: 'small',
				$$events: { click: () => open = !open },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, open ? "Close tooltip" : "Open tooltip"));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}