import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function _Simple($$anchor) {
	DataTable($$anchor, {
		'table$aria-label': 'People list',
		style: 'max-width: 100%;',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			Head(node, {
				children: ($$anchor, $$slotProps) => {
					Row($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							Cell(node_1, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Name');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_2 = $.sibling(node_1, 2);

							Cell(node_2, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Favorite Color');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							Cell(node_3, {
								numeric: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Favorite Number');

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

			var node_4 = $.sibling(node, 2);

			Body(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_5 = $.first_child(fragment_4);

					Row(node_5, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var node_6 = $.first_child(fragment_5);

							Cell(node_6, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Steve');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							Cell(node_7, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Red');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							Cell(node_8, {
								numeric: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('45');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_5, 2);

					Row(node_9, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_10 = $.first_child(fragment_6);

							Cell(node_10, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Sharon');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							var node_11 = $.sibling(node_10, 2);

							Cell(node_11, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Purple');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_11, 2);

							Cell(node_12, {
								numeric: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('5');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_9, 2);

					Row(node_13, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root();
							var node_14 = $.first_child(fragment_7);

							Cell(node_14, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Rodney');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							var node_15 = $.sibling(node_14, 2);

							Cell(node_15, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Orange');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});

							var node_16 = $.sibling(node_15, 2);

							Cell(node_16, {
								numeric: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_11 = $.text('32');

									$.append($$anchor, text_11);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_13, 2);

					Row(node_17, {
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root();
							var node_18 = $.first_child(fragment_8);

							Cell(node_18, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_12 = $.text('Mack');

									$.append($$anchor, text_12);
								},
								$$slots: { default: true }
							});

							var node_19 = $.sibling(node_18, 2);

							Cell(node_19, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_13 = $.text('Blue');

									$.append($$anchor, text_13);
								},
								$$slots: { default: true }
							});

							var node_20 = $.sibling(node_19, 2);

							Cell(node_20, {
								numeric: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_14 = $.text('12');

									$.append($$anchor, text_14);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_8);
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