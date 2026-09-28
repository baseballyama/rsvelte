import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow
} from '$lib/components/ui/table';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div><!> <p class="text-muted-foreground mt-4 text-center text-sm">Basic table</p></div>`);

export default function Table_01($$anchor) {
	const items = [
		{
			balance: '$1,250.00',
			email: 'alex.t@company.com',
			id: '1',
			location: 'San Francisco, US',
			name: 'Alex Thompson',
			status: 'Active'
		},

		{
			balance: '$600.00',
			email: 'sarah.c@company.com',
			id: '2',
			location: 'Singapore',
			name: 'Sarah Chen',
			status: 'Active'
		},

		{
			balance: '$650.00',
			email: 'j.wilson@company.com',
			id: '3',
			location: 'London, UK',
			name: 'James Wilson',
			status: 'Inactive'
		},

		{
			balance: '$0.00',
			email: 'm.garcia@company.com',
			id: '4',
			location: 'Madrid, Spain',
			name: 'Maria Garcia',
			status: 'Active'
		},

		{
			balance: '-$1,000.00',
			email: 'd.kim@company.com',
			id: '5',
			location: 'Seoul, KR',
			name: 'David Kim',
			status: 'Active'
		}
	];

	var div = root_3();
	var node = $.child(div);

	Table(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_2();
			var node_1 = $.first_child(fragment);

			TableHeader(node_1, {
				children: ($$anchor, $$slotProps) => {
					TableRow($$anchor, {
						class: 'hover:bg-transparent',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							TableHead(node_2, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Name');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							TableHead(node_3, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Email');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							TableHead(node_4, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Location');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_5 = $.sibling(node_4, 2);

							TableHead(node_5, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Status');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							TableHead(node_6, {
								class: 'text-right',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Balance');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_1, 2);

			TableBody(node_7, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_8 = $.first_child(fragment_3);

					$.each(node_8, 17, () => items, (item) => item.id, ($$anchor, item) => {
						TableRow($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root();
								var node_9 = $.first_child(fragment_5);

								TableCell(node_9, {
									class: 'font-medium',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text();

										$.template_effect(() => $.set_text(text_5, $.get(item).name));
										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});

								var node_10 = $.sibling(node_9, 2);

								TableCell(node_10, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text();

										$.template_effect(() => $.set_text(text_6, $.get(item).email));
										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});

								var node_11 = $.sibling(node_10, 2);

								TableCell(node_11, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_7 = $.text();

										$.template_effect(() => $.set_text(text_7, $.get(item).location));
										$.append($$anchor, text_7);
									},
									$$slots: { default: true }
								});

								var node_12 = $.sibling(node_11, 2);

								TableCell(node_12, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_8 = $.text();

										$.template_effect(() => $.set_text(text_8, $.get(item).status));
										$.append($$anchor, text_8);
									},
									$$slots: { default: true }
								});

								var node_13 = $.sibling(node_12, 2);

								TableCell(node_13, {
									class: 'text-right',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_9 = $.text();

										$.template_effect(() => $.set_text(text_9, $.get(item).balance));
										$.append($$anchor, text_9);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_7, 2);

			TableFooter(node_14, {
				class: 'bg-transparent',
				children: ($$anchor, $$slotProps) => {
					TableRow($$anchor, {
						class: 'hover:bg-transparent',
						children: ($$anchor, $$slotProps) => {
							var fragment_12 = root_1();
							var node_15 = $.first_child(fragment_12);

							TableCell(node_15, {
								colspan: 4,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Total');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});

							var node_16 = $.sibling(node_15, 2);

							TableCell(node_16, {
								class: 'text-right',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_11 = $.text('$2,500.00');

									$.append($$anchor, text_11);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_12);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}