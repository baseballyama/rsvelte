import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Table,
	TableBody,
	TableBodyCell,
	TableBodyRow,
	TableHead,
	TableHeadCell
} from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <tfoot><tr class="font-semibold text-gray-900 dark:text-white"><th scope="row" class="px-6 py-3 text-base">Total</th><td class="px-6 py-3">3</td><td class="px-6 py-3">21,000</td></tr></tfoot>`, 1);

export default function Foot($$anchor) {
	Table($$anchor, {
		border: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			TableHead(node, {
				class: 'bg-gray-100 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					TableHeadCell(node_1, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Product name');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					TableHeadCell(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Qty');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					TableHeadCell(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Price');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node, 2);

			TableBody(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_5 = $.first_child(fragment_3);

					TableBodyRow(node_5, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_6 = $.first_child(fragment_4);

							TableBodyCell(node_6, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Apple MacBook Pro 17"');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							TableBodyCell(node_7, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('1');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							TableBodyCell(node_8, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('$2999');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_5, 2);

					TableBodyRow(node_9, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var node_10 = $.first_child(fragment_5);

							TableBodyCell(node_10, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Microsoft Surface Pro');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							var node_11 = $.sibling(node_10, 2);

							TableBodyCell(node_11, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('1');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_11, 2);

							TableBodyCell(node_12, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('$1999');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_9, 2);

					TableBodyRow(node_13, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_14 = $.first_child(fragment_6);

							TableBodyCell(node_14, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Magic Mouse 2');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							var node_15 = $.sibling(node_14, 2);

							TableBodyCell(node_15, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('1');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});

							var node_16 = $.sibling(node_15, 2);

							TableBodyCell(node_16, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_11 = $.text('$99');

									$.append($$anchor, text_11);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}