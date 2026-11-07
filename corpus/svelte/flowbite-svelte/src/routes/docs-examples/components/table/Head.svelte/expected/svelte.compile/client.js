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

var root = $.from_html(`<tr><!><!></tr> <tr><!><!><!><!><!></tr>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Head($$anchor) {
	Table($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			TableHead(node, {
				defaultRow: false,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var tr = $.first_child(fragment_2);
					var node_1 = $.child(tr);

					TableHeadCell(node_1, {
						colspan: 2,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Product');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1);

					TableHeadCell(node_2, {
						colspan: 3,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Info');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.reset(tr);

					var tr_1 = $.sibling(tr, 2);
					var node_3 = $.child(tr_1);

					TableHeadCell(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Brand');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3);

					TableHeadCell(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Product name');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4);

					TableHeadCell(node_5, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Color');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5);

					TableHeadCell(node_6, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Category');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6);

					TableHeadCell(node_7, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Price');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					$.reset(tr_1);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node, 2);

			TableBody(node_8, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_2();
					var node_9 = $.first_child(fragment_3);

					TableBodyRow(node_9, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_10 = $.first_child(fragment_4);

							TableBodyCell(node_10, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Apple');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							var node_11 = $.sibling(node_10, 2);

							TableBodyCell(node_11, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Apple MacBook Pro 17"');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_11, 2);

							TableBodyCell(node_12, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Silver');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							var node_13 = $.sibling(node_12, 2);

							TableBodyCell(node_13, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Laptop');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});

							var node_14 = $.sibling(node_13, 2);

							TableBodyCell(node_14, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_11 = $.text('$2999');

									$.append($$anchor, text_11);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_9, 2);

					TableBodyRow(node_15, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_1();
							var node_16 = $.first_child(fragment_5);

							TableBodyCell(node_16, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_12 = $.text('Microsoft');

									$.append($$anchor, text_12);
								},
								$$slots: { default: true }
							});

							var node_17 = $.sibling(node_16, 2);

							TableBodyCell(node_17, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_13 = $.text('Microsoft Surface Pro');

									$.append($$anchor, text_13);
								},
								$$slots: { default: true }
							});

							var node_18 = $.sibling(node_17, 2);

							TableBodyCell(node_18, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_14 = $.text('White');

									$.append($$anchor, text_14);
								},
								$$slots: { default: true }
							});

							var node_19 = $.sibling(node_18, 2);

							TableBodyCell(node_19, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_15 = $.text('Laptop PC');

									$.append($$anchor, text_15);
								},
								$$slots: { default: true }
							});

							var node_20 = $.sibling(node_19, 2);

							TableBodyCell(node_20, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_16 = $.text('$1999');

									$.append($$anchor, text_16);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_21 = $.sibling(node_15, 2);

					TableBodyRow(node_21, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_1();
							var node_22 = $.first_child(fragment_6);

							TableBodyCell(node_22, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_17 = $.text('Apple');

									$.append($$anchor, text_17);
								},
								$$slots: { default: true }
							});

							var node_23 = $.sibling(node_22, 2);

							TableBodyCell(node_23, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_18 = $.text('Magic Mouse 2');

									$.append($$anchor, text_18);
								},
								$$slots: { default: true }
							});

							var node_24 = $.sibling(node_23, 2);

							TableBodyCell(node_24, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_19 = $.text('Black');

									$.append($$anchor, text_19);
								},
								$$slots: { default: true }
							});

							var node_25 = $.sibling(node_24, 2);

							TableBodyCell(node_25, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_20 = $.text('Accessories');

									$.append($$anchor, text_20);
								},
								$$slots: { default: true }
							});

							var node_26 = $.sibling(node_25, 2);

							TableBodyCell(node_26, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_21 = $.text('$99');

									$.append($$anchor, text_21);
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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}