import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, Portal, Tooltip } from "carbon-components-svelte";

var root = $.from_html(`<p>Top</p>`);
var root_1 = $.from_html(`<p>Right</p>`);
var root_2 = $.from_html(`<p>Bottom</p>`);
var root_3 = $.from_html(`<p>Left</p>`);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!>`, 1);

export default function TooltipModal($$anchor) {
	let open = false;
	var fragment = root_5();
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
				modalHeading: 'Tooltip in modal',
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
					var fragment_2 = root_4();
					var node_2 = $.first_child(fragment_2);

					Tooltip(node_2, {
						triggerText: 'Top',
						direction: 'top',
						children: ($$anchor, $$slotProps) => {
							var p = root();

							$.append($$anchor, p);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Tooltip(node_3, {
						triggerText: 'Right',
						direction: 'right',
						children: ($$anchor, $$slotProps) => {
							var p_1 = root_1();

							$.append($$anchor, p_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Tooltip(node_4, {
						triggerText: 'Bottom',
						direction: 'bottom',
						children: ($$anchor, $$slotProps) => {
							var p_2 = root_2();

							$.append($$anchor, p_2);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Tooltip(node_5, {
						triggerText: 'Left',
						direction: 'left',
						children: ($$anchor, $$slotProps) => {
							var p_3 = root_3();

							$.append($$anchor, p_3);
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