import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	StructuredList,
	StructuredListBody,
	StructuredListCell,
	StructuredListHead,
	StructuredListInput,
	StructuredListRow
} from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <div data-testid="selected-value"> </div>`, 1);

export default function StructuredListFixture($$anchor) {
	let selected = undefined;
	var fragment = root_2();
	var node = $.first_child(fragment);

	StructuredList(node, {
		'data-testid': 'structured-list',
		selection: true,
		get selected() {
			return selected;
		},

		set selected($$value) {
			selected = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			StructuredListHead(node_1, {
				children: ($$anchor, $$slotProps) => {
					StructuredListRow($$anchor, {
						head: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							StructuredListCell(node_2, {
								head: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Name');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							StructuredListCell(node_3, {
								head: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Value');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							StructuredListCell(node_4, {
								head: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text();

									text_2.nodeValue = '';
									$.append($$anchor, text_2);
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

			var node_5 = $.sibling(node_1, 2);

			StructuredListBody(node_5, {
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_1();
					var node_6 = $.first_child(fragment_5);

					StructuredListRow(node_6, {
						label: true,
						for: 'row-a',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_7 = $.first_child(fragment_6);

							StructuredListCell(node_7, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Row A');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							StructuredListCell(node_8, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Value A');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							StructuredListInput(node_9, { id: 'row-a', value: 'a', title: 'Select row A' });
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_6, 2);

					StructuredListRow(node_10, {
						label: true,
						for: 'row-b',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root();
							var node_11 = $.first_child(fragment_7);

							StructuredListCell(node_11, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Row B');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_11, 2);

							StructuredListCell(node_12, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Value B');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							var node_13 = $.sibling(node_12, 2);

							StructuredListInput(node_13, { id: 'row-b', value: 'b', title: 'Select row B' });
							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var text_7 = $.only_child(div, true);

	$.template_effect(() => $.set_text(text_7, selected ?? "none"));
	$.append($$anchor, fragment);
}