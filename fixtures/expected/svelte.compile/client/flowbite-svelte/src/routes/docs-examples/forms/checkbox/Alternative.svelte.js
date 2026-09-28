import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Checkbox,
	Table,
	TableHead,
	TableHeadCell,
	TableBody,
	TableBodyCell,
	Label,
	TableBodyRow
} from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`Label on the other side <!>`, 1);

export default function Alternative($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Table(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			TableHead(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					TableHeadCell(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Left column');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					TableHeadCell(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Right column');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			TableBody(node_4, {
				class: 'divide-y dark:divide-gray-700',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_5 = $.first_child(fragment_3);

					TableBodyRow(node_5, {
						class: 'divide-x rtl:divide-x-reverse dark:divide-gray-700',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_6 = $.first_child(fragment_4);

							TableBodyCell(node_6, {
								children: ($$anchor, $$slotProps) => {
									Label($$anchor, {
										for: 'checkbox1',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Default checkbox');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							TableBodyCell(node_7, {
								children: ($$anchor, $$slotProps) => {
									Label($$anchor, {
										for: 'checkbox2',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Disabled checkbox');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_5, 2);

					TableBodyRow(node_8, {
						class: 'divide-x rtl:divide-x-reverse dark:divide-gray-700',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root();
							var node_9 = $.first_child(fragment_7);

							TableBodyCell(node_9, {
								children: ($$anchor, $$slotProps) => {
									Checkbox($$anchor, { id: 'checkbox1', checked: true });
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_9, 2);

							TableBodyCell(node_10, {
								children: ($$anchor, $$slotProps) => {
									Checkbox($$anchor, { id: 'checkbox2', disabled: true });
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node, 2);

	Label(node_11, {
		color: 'red',
		class: 'mt-4 flex items-center font-bold italic',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_10 = root_1();
			var node_12 = $.sibling($.first_child(fragment_10));

			Checkbox(node_12, { classes: { div: "ms-2" } });
			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}