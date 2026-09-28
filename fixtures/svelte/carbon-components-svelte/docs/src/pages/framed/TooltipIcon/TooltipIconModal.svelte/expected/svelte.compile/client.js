import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, Portal, TooltipIcon } from "carbon-components-svelte";
import Filter from "carbon-icons-svelte/lib/Filter.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function TooltipIconModal($$anchor) {
	let open = false;
	var fragment = root_1();
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
				modalHeading: 'TooltipIcon in modal',
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

					TooltipIcon(node_2, {
						tooltipText: 'Top',
						direction: 'top',
						get icon() {
							return Filter;
						}
					});

					var node_3 = $.sibling(node_2, 2);

					TooltipIcon(node_3, {
						tooltipText: 'Right',
						direction: 'right',
						get icon() {
							return Filter;
						}
					});

					var node_4 = $.sibling(node_3, 2);

					TooltipIcon(node_4, {
						tooltipText: 'Bottom',
						direction: 'bottom',
						get icon() {
							return Filter;
						}
					});

					var node_5 = $.sibling(node_4, 2);

					TooltipIcon(node_5, {
						tooltipText: 'Left',
						direction: 'left',
						get icon() {
							return Filter;
						}
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