import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	Link,
	Modal,
	Portal,
	Stack,
	Toggletip,
	ToggletipFooter
} from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`Resources are provisioned based on your account's organization. <!>`, 1);
var root_2 = $.from_html(`Resource list <!>`, 1);

export default function ToggletipModal($$anchor) {
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
				passiveModal: true,
				modalHeading: 'Toggletip in modal',
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
				},
				$$events: { close: () => open = false },
				children: ($$anchor, $$slotProps) => {
					Stack($$anchor, {
						orientation: 'horizontal',
						align: 'center',
						gap: 3,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_3 = root_2();
							var node_2 = $.sibling($.first_child(fragment_3));

							Toggletip(node_2, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_4 = root_1();
									var node_3 = $.sibling($.first_child(fragment_4));

									ToggletipFooter(node_3, {
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root();
											var node_4 = $.first_child(fragment_5);

											Link(node_4, {
												href: '#',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Learn more');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});

											var node_5 = $.sibling(node_4, 2);

											Button(node_5, {
												size: 'small',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Manage');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}