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

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Colors1($$anchor) {
	Table($$anchor, {
		color: 'blue',
		hoverable: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			TableHead(node, {
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

							var text_1 = $.text('Color');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					TableHeadCell(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Category');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					TableHeadCell(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Price');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node, 2);

			TableBody(node_5, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_6 = $.first_child(fragment_3);

					TableBodyRow(node_6, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_7 = $.first_child(fragment_4);

							TableBodyCell(node_7, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Apple MacBook Pro 17"');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							TableBodyCell(node_8, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Silver');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							TableBodyCell(node_9, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Laptop');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_9, 2);

							TableBodyCell(node_10, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('$2999');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_6, 2);

					TableBodyRow(node_11, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var node_12 = $.first_child(fragment_5);

							TableBodyCell(node_12, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Microsoft Surface Pro');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							var node_13 = $.sibling(node_12, 2);

							TableBodyCell(node_13, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('White');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							var node_14 = $.sibling(node_13, 2);

							TableBodyCell(node_14, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Laptop PC');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});

							var node_15 = $.sibling(node_14, 2);

							TableBodyCell(node_15, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_11 = $.text('$1999');

									$.append($$anchor, text_11);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_11, 2);

					TableBodyRow(node_16, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_17 = $.first_child(fragment_6);

							TableBodyCell(node_17, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_12 = $.text('Magic Mouse 2');

									$.append($$anchor, text_12);
								},
								$$slots: { default: true }
							});

							var node_18 = $.sibling(node_17, 2);

							TableBodyCell(node_18, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_13 = $.text('Black');

									$.append($$anchor, text_13);
								},
								$$slots: { default: true }
							});

							var node_19 = $.sibling(node_18, 2);

							TableBodyCell(node_19, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_14 = $.text('Accessories');

									$.append($$anchor, text_14);
								},
								$$slots: { default: true }
							});

							var node_20 = $.sibling(node_19, 2);

							TableBodyCell(node_20, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_15 = $.text('$99');

									$.append($$anchor, text_15);
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