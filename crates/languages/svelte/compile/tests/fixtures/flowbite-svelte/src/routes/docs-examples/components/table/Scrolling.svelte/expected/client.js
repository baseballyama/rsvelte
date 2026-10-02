import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Table,
	TableBody,
	TableBodyCell,
	TableBodyRow,
	TableHead,
	TableHeadCell,
	Checkbox
} from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<a href="/tables" class="text-primary-600 dark:text-primary-500 font-medium hover:underline">Edit</a> <a href="/tables" class="font-medium text-red-600 hover:underline dark:text-red-500">Remove</a>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Scrolling($$anchor) {
	Table($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			TableHead(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					TableHeadCell(node_1, {
						class: 'p-4!',
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {});
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					TableHeadCell(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Product name');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					TableHeadCell(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Color');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					TableHeadCell(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Category');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					TableHeadCell(node_5, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('ACCESSORIES');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					TableHeadCell(node_6, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('AVAILABLE');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					TableHeadCell(node_7, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Price');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					TableHeadCell(node_8, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('WEIGHT');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					TableHeadCell(node_9, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('ACTION');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node, 2);

			TableBody(node_10, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_11 = $.first_child(fragment_4);

					TableBodyRow(node_11, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var node_12 = $.first_child(fragment_5);

							TableBodyCell(node_12, {
								class: 'p-4!',
								children: ($$anchor, $$slotProps) => {
									Checkbox($$anchor, {});
								},
								$$slots: { default: true }
							});

							var node_13 = $.sibling(node_12, 2);

							TableBodyCell(node_13, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Apple MacBook Pro 17"');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							var node_14 = $.sibling(node_13, 2);

							TableBodyCell(node_14, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Silver');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							var node_15 = $.sibling(node_14, 2);

							TableBodyCell(node_15, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Laptop');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});

							var node_16 = $.sibling(node_15, 2);

							TableBodyCell(node_16, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_11 = $.text('Yes');

									$.append($$anchor, text_11);
								},
								$$slots: { default: true }
							});

							var node_17 = $.sibling(node_16, 2);

							TableBodyCell(node_17, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_12 = $.text('Yes');

									$.append($$anchor, text_12);
								},
								$$slots: { default: true }
							});

							var node_18 = $.sibling(node_17, 2);

							TableBodyCell(node_18, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_13 = $.text('$2999');

									$.append($$anchor, text_13);
								},
								$$slots: { default: true }
							});

							var node_19 = $.sibling(node_18, 2);

							TableBodyCell(node_19, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_14 = $.text('3.0 lb.');

									$.append($$anchor, text_14);
								},
								$$slots: { default: true }
							});

							var node_20 = $.sibling(node_19, 2);

							TableBodyCell(node_20, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_1();

									$.next(2);
									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_21 = $.sibling(node_11, 2);

					TableBodyRow(node_21, {
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root();
							var node_22 = $.first_child(fragment_8);

							TableBodyCell(node_22, {
								class: 'p-4!',
								children: ($$anchor, $$slotProps) => {
									Checkbox($$anchor, {});
								},
								$$slots: { default: true }
							});

							var node_23 = $.sibling(node_22, 2);

							TableBodyCell(node_23, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_15 = $.text('Microsoft Surface Pro');

									$.append($$anchor, text_15);
								},
								$$slots: { default: true }
							});

							var node_24 = $.sibling(node_23, 2);

							TableBodyCell(node_24, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_16 = $.text('White');

									$.append($$anchor, text_16);
								},
								$$slots: { default: true }
							});

							var node_25 = $.sibling(node_24, 2);

							TableBodyCell(node_25, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_17 = $.text('Laptop PC');

									$.append($$anchor, text_17);
								},
								$$slots: { default: true }
							});

							var node_26 = $.sibling(node_25, 2);

							TableBodyCell(node_26, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_18 = $.text('No');

									$.append($$anchor, text_18);
								},
								$$slots: { default: true }
							});

							var node_27 = $.sibling(node_26, 2);

							TableBodyCell(node_27, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_19 = $.text('Yes');

									$.append($$anchor, text_19);
								},
								$$slots: { default: true }
							});

							var node_28 = $.sibling(node_27, 2);

							TableBodyCell(node_28, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_20 = $.text('$1999');

									$.append($$anchor, text_20);
								},
								$$slots: { default: true }
							});

							var node_29 = $.sibling(node_28, 2);

							TableBodyCell(node_29, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_21 = $.text('1.0 lb.');

									$.append($$anchor, text_21);
								},
								$$slots: { default: true }
							});

							var node_30 = $.sibling(node_29, 2);

							TableBodyCell(node_30, {
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_1();

									$.next(2);
									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});

					var node_31 = $.sibling(node_21, 2);

					TableBodyRow(node_31, {
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root();
							var node_32 = $.first_child(fragment_11);

							TableBodyCell(node_32, {
								class: 'p-4!',
								children: ($$anchor, $$slotProps) => {
									Checkbox($$anchor, {});
								},
								$$slots: { default: true }
							});

							var node_33 = $.sibling(node_32, 2);

							TableBodyCell(node_33, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_22 = $.text('Magic Mouse 2');

									$.append($$anchor, text_22);
								},
								$$slots: { default: true }
							});

							var node_34 = $.sibling(node_33, 2);

							TableBodyCell(node_34, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_23 = $.text('Black');

									$.append($$anchor, text_23);
								},
								$$slots: { default: true }
							});

							var node_35 = $.sibling(node_34, 2);

							TableBodyCell(node_35, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_24 = $.text('Accessories');

									$.append($$anchor, text_24);
								},
								$$slots: { default: true }
							});

							var node_36 = $.sibling(node_35, 2);

							TableBodyCell(node_36, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_25 = $.text('Yes');

									$.append($$anchor, text_25);
								},
								$$slots: { default: true }
							});

							var node_37 = $.sibling(node_36, 2);

							TableBodyCell(node_37, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_26 = $.text('No');

									$.append($$anchor, text_26);
								},
								$$slots: { default: true }
							});

							var node_38 = $.sibling(node_37, 2);

							TableBodyCell(node_38, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_27 = $.text('$99');

									$.append($$anchor, text_27);
								},
								$$slots: { default: true }
							});

							var node_39 = $.sibling(node_38, 2);

							TableBodyCell(node_39, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_28 = $.text('0.2 lb.');

									$.append($$anchor, text_28);
								},
								$$slots: { default: true }
							});

							var node_40 = $.sibling(node_39, 2);

							TableBodyCell(node_40, {
								children: ($$anchor, $$slotProps) => {
									var fragment_13 = root_1();

									$.next(2);
									$.append($$anchor, fragment_13);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}