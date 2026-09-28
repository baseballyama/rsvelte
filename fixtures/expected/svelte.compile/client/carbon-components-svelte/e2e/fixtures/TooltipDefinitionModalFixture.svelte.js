import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Modal, TooltipDefinition } from "carbon-components-svelte";

var root = $.from_html(`<div data-testid="overflow-box" style="overflow: hidden; max-height: 3rem; padding: 0.5rem;"><!></div>`);
var root_1 = $.from_html(`<button type="button" data-testid="open-modal">Open modal</button> <!>`, 1);

export default function TooltipDefinitionModalFixture($$anchor) {
	let open = false;
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	Modal(node, {
		'data-testid': 'modal',
		modalHeading: 'Modal for tooltip test',
		primaryButtonText: 'Save',
		secondaryButtonText: 'Cancel',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node_1 = $.child(div);

			TooltipDefinition(node_1, {
				'data-testid': 'tooltip-definition-modal',
				tooltipText: 'Portaled definition text',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Definition in modal');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.event('click', button, () => open = true);
	$.append($$anchor, fragment);
}