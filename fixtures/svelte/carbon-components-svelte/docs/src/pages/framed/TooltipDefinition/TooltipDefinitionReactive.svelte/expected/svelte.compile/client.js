import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Stack, TooltipDefinition } from "carbon-components-svelte";

var root = $.from_html(`<div><!></div> <div><!></div>`, 1);

export default function TooltipDefinitionReactive($$anchor) {
	let open = true;

	Stack($$anchor, {
		gap: 12,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			TooltipDefinition(node, {
				align: 'start',
				tooltipText: 'IBM Corporate Headquarters is based in Armonk, New York.',
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Armonk');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
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

					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, open ? "Close tooltip" : "Open tooltip"));
					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}