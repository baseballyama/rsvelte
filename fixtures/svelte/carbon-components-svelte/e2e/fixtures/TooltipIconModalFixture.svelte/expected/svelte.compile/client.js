import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Modal, TooltipIcon } from "carbon-components-svelte";
import Information from "carbon-icons-svelte/lib/Information.svelte";

var root = $.from_html(`<div data-testid="overflow-box" style="overflow: hidden; max-height: 3rem; padding: 0.5rem;"><!></div>`);
var root_1 = $.from_html(`<button type="button" data-testid="open-modal">Open modal</button> <!>`, 1);

export default function TooltipIconModalFixture($$anchor) {
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

			TooltipIcon(node_1, {
				'data-testid': 'tooltip-icon-modal',
				tooltipText: 'Portaled icon tooltip',
				get icon() {
					return Information;
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.event('click', button, () => open = true);
	$.append($$anchor, fragment);
}