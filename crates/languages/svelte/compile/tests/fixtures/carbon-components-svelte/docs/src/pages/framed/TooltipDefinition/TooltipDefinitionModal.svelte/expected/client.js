import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, Portal, TooltipDefinition } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function TooltipDefinitionModal($$anchor) {
	let open = false;
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Open modal');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Portal(node_1, {
		children: ($$anchor, $$slotProps) => {
			Modal($$anchor, {
				size: 'sm',
				modalHeading: 'TooltipDefinition in modal',
				primaryButtonText: 'Done',
				secondaryButtonText: 'Cancel',
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
				},
				$$events: { 'click:button--secondary': () => open = false },
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					TooltipDefinition(node_2, {
						direction: 'top',
						tooltipText: 'IBM Corporate Headquarters is based in Armonk, New York.',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Armonk (top)');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					TooltipDefinition(node_3, {
						direction: 'bottom',
						tooltipText: 'IBM Corporate Headquarters is based in Armonk, New York.',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Armonk (bottom)');

							$.append($$anchor, text_2);
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