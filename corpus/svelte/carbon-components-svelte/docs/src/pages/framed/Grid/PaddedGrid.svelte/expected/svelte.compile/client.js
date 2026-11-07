import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Column, Grid, Row, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div style="padding: var(--cds-spacing-05)">Adding padding to Grid applies it to columns in all rows:</div> <!> <div style="padding: var(--cds-spacing-05)">Adding padding to a Row only applies to its columns:</div> <!> <div style="padding: var(--cds-spacing-05)">Adding padding to a specific column only applies it to the column:</div> <!>`, 1);

export default function PaddedGrid($$anchor) {
	Stack($$anchor, {
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.sibling($.first_child(fragment_1), 2);

			Grid(node, {
				padding: true,
				children: ($$anchor, $$slotProps) => {
					Row($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							Column(node_1, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Column');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_2 = $.sibling(node_1, 2);

							Column(node_2, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Column');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							Column(node_3, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Column');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							Column(node_4, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Column');

									$.append($$anchor, text_3);
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

			var node_5 = $.sibling(node, 4);

			Grid(node_5, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_6 = $.first_child(fragment_4);

					Row(node_6, {
						padding: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var node_7 = $.first_child(fragment_5);

							Column(node_7, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Column');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							Column(node_8, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Column');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							Column(node_9, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Column');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_9, 2);

							Column(node_10, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Column');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_6, 2);

					Row(node_11, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_12 = $.first_child(fragment_6);

							Column(node_12, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Column');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							var node_13 = $.sibling(node_12, 2);

							Column(node_13, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Column');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							var node_14 = $.sibling(node_13, 2);

							Column(node_14, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Column');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});

							var node_15 = $.sibling(node_14, 2);

							Column(node_15, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_11 = $.text('Column');

									$.append($$anchor, text_11);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_16 = $.sibling(node_5, 4);

			Grid(node_16, {
				children: ($$anchor, $$slotProps) => {
					Row($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root();
							var node_17 = $.first_child(fragment_8);

							Column(node_17, {
								padding: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_12 = $.text('Column');

									$.append($$anchor, text_12);
								},
								$$slots: { default: true }
							});

							var node_18 = $.sibling(node_17, 2);

							Column(node_18, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_13 = $.text('Column');

									$.append($$anchor, text_13);
								},
								$$slots: { default: true }
							});

							var node_19 = $.sibling(node_18, 2);

							Column(node_19, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_14 = $.text('Column');

									$.append($$anchor, text_14);
								},
								$$slots: { default: true }
							});

							var node_20 = $.sibling(node_19, 2);

							Column(node_20, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_15 = $.text('Column');

									$.append($$anchor, text_15);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}