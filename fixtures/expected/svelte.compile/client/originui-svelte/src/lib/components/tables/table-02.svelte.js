import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '$lib/components/ui/table';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-3"><img class="rounded-full"/> <div><div class="font-medium"> </div> <span class="text-muted-foreground mt-0.5 text-xs"> </span></div></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div><!> <p class="text-muted-foreground mt-4 text-center text-sm">Table with images</p></div>`);

export default function Table_02($$anchor) {
	const items = [
		{
			balance: '$1,250.00',
			email: 'alex.t@company.com',
			id: '1',
			image: 'https://res.cloudinary.com/dlzlfasou/image/upload/v1736358071/avatar-40-02_upqrxi.jpg',
			location: 'San Francisco, US',
			name: 'Alex Thompson',
			status: 'Active',
			username: '@alexthompson'
		},

		{
			balance: '$600.00',
			email: 'sarah.c@company.com',
			id: '2',
			image: 'https://res.cloudinary.com/dlzlfasou/image/upload/v1736358073/avatar-40-01_ij9v7j.jpg',
			location: 'Singapore',
			name: 'Sarah Chen',
			status: 'Active',
			username: '@sarahchen'
		},

		{
			balance: '$0.00',
			email: 'm.garcia@company.com',
			id: '4',
			image: 'https://res.cloudinary.com/dlzlfasou/image/upload/v1736358072/avatar-40-03_dkeufx.jpg',
			location: 'Madrid, Spain',
			name: 'Maria Garcia',
			status: 'Active',
			username: '@mariagarcia'
		},

		{
			balance: '-$1,000.00',
			email: 'd.kim@company.com',
			id: '5',
			image: 'https://res.cloudinary.com/dlzlfasou/image/upload/v1736358070/avatar-40-05_cmz0mg.jpg',
			location: 'Seoul, KR',
			name: 'David Kim',
			status: 'Active',
			username: '@davidkim'
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
									children: ($$anchor, $$slotProps) => {
										var div_1 = root_1();
										var img = $.child(div_1);

										$.set_attribute(img, 'width', 40);
										$.set_attribute(img, 'height', 40);

										var div_2 = $.sibling(img, 2);
										var div_3 = $.child(div_2);
										var text_5 = $.only_child(div_3, true);
										var span = $.sibling(div_3, 2);
										var text_6 = $.only_child(span, true);

										$.reset(div_2);
										$.reset(div_1);

										$.template_effect(() => {
											$.set_attribute(img, 'src', $.get(item).image);
											$.set_attribute(img, 'alt', $.get(item).name);
											$.set_text(text_5, $.get(item).name);
											$.set_text(text_6, $.get(item).username);
										});

										$.append($$anchor, div_1);
									},
									$$slots: { default: true }
								});

								var node_10 = $.sibling(node_9, 2);

								TableCell(node_10, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_7 = $.text();

										$.template_effect(() => $.set_text(text_7, $.get(item).email));
										$.append($$anchor, text_7);
									},
									$$slots: { default: true }
								});

								var node_11 = $.sibling(node_10, 2);

								TableCell(node_11, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_8 = $.text();

										$.template_effect(() => $.set_text(text_8, $.get(item).location));
										$.append($$anchor, text_8);
									},
									$$slots: { default: true }
								});

								var node_12 = $.sibling(node_11, 2);

								TableCell(node_12, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_9 = $.text();

										$.template_effect(() => $.set_text(text_9, $.get(item).status));
										$.append($$anchor, text_9);
									},
									$$slots: { default: true }
								});

								var node_13 = $.sibling(node_12, 2);

								TableCell(node_13, {
									class: 'text-right',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_10 = $.text();

										$.template_effect(() => $.set_text(text_10, $.get(item).balance));
										$.append($$anchor, text_10);
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

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}