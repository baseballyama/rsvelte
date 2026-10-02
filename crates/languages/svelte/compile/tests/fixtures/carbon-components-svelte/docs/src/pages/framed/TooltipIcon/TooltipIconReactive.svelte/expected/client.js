import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Stack, TooltipIcon } from "carbon-components-svelte";
import Carbon from "carbon-icons-svelte/lib/Carbon.svelte";

var root = $.from_html(`<div><!></div> <div><!></div>`, 1);

export default function TooltipIconReactive($$anchor) {
	let open = true;

	Stack($$anchor, {
		gap: 12,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			TooltipIcon(node, {
				tooltipText: 'Carbon is an open source design system by IBM.',
				get icon() {
					return Carbon;
				},
				align: 'start',
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
				}
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_1 = $.child(div_1);

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

			$.reset(div_1);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}