import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Table, TableBody, TableCell, TableRow } from '$lib/components/ui/table';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="mx-auto max-w-lg"><div class="bg-background overflow-hidden rounded-md border"><!></div> <p class="text-muted-foreground mt-4 text-center text-sm">Vertical table</p></div>`);

export default function Table_09($$anchor) {
	var div = root_2();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Table(node, {
		children: ($$anchor, $$slotProps) => {
			TableBody($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_1 = $.first_child(fragment_1);

					TableRow(node_1, {
						class: '*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							TableCell(node_2, {
								class: 'bg-muted/50 py-2 font-medium',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Name');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							TableCell(node_3, {
								class: 'py-2',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('David Kim');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_1, 2);

					TableRow(node_4, {
						class: '*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_5 = $.first_child(fragment_3);

							TableCell(node_5, {
								class: 'bg-muted/50 py-2 font-medium',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Email');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							TableCell(node_6, {
								class: 'py-2',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('d.kim@company.com');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_4, 2);

					TableRow(node_7, {
						class: '*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_8 = $.first_child(fragment_4);

							TableCell(node_8, {
								class: 'bg-muted/50 py-2 font-medium',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Location');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							TableCell(node_9, {
								class: 'py-2',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Seoul, KR');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_7, 2);

					TableRow(node_10, {
						class: '*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var node_11 = $.first_child(fragment_5);

							TableCell(node_11, {
								class: 'bg-muted/50 py-2 font-medium',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Status');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_11, 2);

							TableCell(node_12, {
								class: 'py-2',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Active');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_10, 2);

					TableRow(node_13, {
						class: '*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_14 = $.first_child(fragment_6);

							TableCell(node_14, {
								class: 'bg-muted/50 py-2 font-medium',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Balance');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							var node_15 = $.sibling(node_14, 2);

							TableCell(node_15, {
								class: 'py-2',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('$1,000.00');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}