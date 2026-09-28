import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Kbd,
	Table,
	TableHead,
	TableHeadCell,
	TableBody,
	TableBodyCell,
	TableBodyRow
} from "flowbite-svelte";

import {
	CaretUpSolid,
	CaretDownSolid,
	CaretRightSolid,
	CaretLeftSolid
} from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> or <!>`, 1);
var root_2 = $.from_html(`<!> <span class="sr-only">Arrow key up</span>`, 1);
var root_3 = $.from_html(`<!> <span class="sr-only">Arrow key down</span>`, 1);
var root_4 = $.from_html(`<!> <span class="sr-only">Arrow key left</span>`, 1);
var root_5 = $.from_html(`<!> <span class="sr-only">Arrow key right</span>`, 1);
var root_6 = $.from_html(`<!> <!> or <!> <!>`, 1);
var root_7 = $.from_html(`<!> <!> <!>`, 1);

export default function Table_1($$anchor) {
	Table($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			TableHead(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					TableHeadCell(node_1, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Key');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					TableHeadCell(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Description');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			TableBody(node_3, {
				class: 'divide-y',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_7();
					var node_4 = $.first_child(fragment_3);

					TableBodyRow(node_4, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_5 = $.first_child(fragment_4);

							TableBodyCell(node_5, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_6 = $.first_child(fragment_5);

									Kbd(node_6, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Shift');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_7 = $.sibling(node_6, 2);

									Kbd(node_7, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Tab');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_5, 2);

							TableBodyCell(node_8, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Navigate to interactive elements');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_4, 2);

					TableBodyRow(node_9, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_10 = $.first_child(fragment_6);

							TableBodyCell(node_10, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_1();
									var node_11 = $.first_child(fragment_7);

									Kbd(node_11, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Enter');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});

									var node_12 = $.sibling(node_11, 2);

									Kbd(node_12, {
										class: 'px-4 py-1.5',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Space bar');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});

							var node_13 = $.sibling(node_10, 2);

							TableBodyCell(node_13, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Ensure elements with ARIA role="button" can be activated with both key commands.');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_14 = $.sibling(node_9, 2);

					TableBodyRow(node_14, {
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root();
							var node_15 = $.first_child(fragment_8);

							TableBodyCell(node_15, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_6();
									var node_16 = $.first_child(fragment_9);

									Kbd(node_16, {
										class: 'me-1 inline-flex items-center px-2 py-1.5',
										children: ($$anchor, $$slotProps) => {
											var fragment_10 = root_2();
											var node_17 = $.first_child(fragment_10);

											CaretUpSolid(node_17, {});
											$.next(2);
											$.append($$anchor, fragment_10);
										},
										$$slots: { default: true }
									});

									var node_18 = $.sibling(node_16, 2);

									Kbd(node_18, {
										class: 'me-1 inline-flex items-center px-2 py-1.5',
										children: ($$anchor, $$slotProps) => {
											var fragment_11 = root_3();
											var node_19 = $.first_child(fragment_11);

											CaretDownSolid(node_19, {});
											$.next(2);
											$.append($$anchor, fragment_11);
										},
										$$slots: { default: true }
									});

									var node_20 = $.sibling(node_18, 2);

									Kbd(node_20, {
										class: 'me-1 inline-flex items-center px-2 py-1.5',
										children: ($$anchor, $$slotProps) => {
											var fragment_12 = root_4();
											var node_21 = $.first_child(fragment_12);

											CaretLeftSolid(node_21, {});
											$.next(2);
											$.append($$anchor, fragment_12);
										},
										$$slots: { default: true }
									});

									var node_22 = $.sibling(node_20, 2);

									Kbd(node_22, {
										class: 'me-1 inline-flex items-center px-2 py-1.5',
										children: ($$anchor, $$slotProps) => {
											var fragment_13 = root_5();
											var node_23 = $.first_child(fragment_13);

											CaretRightSolid(node_23, {});
											$.next(2);
											$.append($$anchor, fragment_13);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});

							var node_24 = $.sibling(node_15, 2);

							TableBodyCell(node_24, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Choose and activate previous/next tab.');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_8);
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