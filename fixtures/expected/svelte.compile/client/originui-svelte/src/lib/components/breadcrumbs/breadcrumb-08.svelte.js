import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Database from '@lucide/svelte/icons/database';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator
} from '$lib/components/ui/breadcrumb';

import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';

var root = $.from_html(`<div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[[disabled]]:opacity-50"><!></div> `, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Breadcrumb_08($$anchor) {
	let value = $.state('s1');

	const items = [
		{ label: 'Orion', value: 's1' },
		{ label: 'Sigma', value: 's2' },
		{ label: 'Dorado', value: 's3' }
	];

	const selectedItem = $.derived(() => items.find((item) => item.value === $.get(value)));

	Breadcrumb($$anchor, {
		children: ($$anchor, $$slotProps) => {
			BreadcrumbList($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_2();
					var node = $.first_child(fragment_2);

					BreadcrumbItem(node, {
						children: ($$anchor, $$slotProps) => {
							BreadcrumbLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Databases');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_1 = $.sibling(node, 2);

					BreadcrumbSeparator(node_1, {});

					var node_2 = $.sibling(node_1, 2);

					BreadcrumbItem(node_2, {
						children: ($$anchor, $$slotProps) => {
							Select($$anchor, {
								type: 'single',
								allowDeselect: false,
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_3 = $.first_child(fragment_5);

									SelectTrigger(node_3, {
										id: 'select-database',
										class: 'relative ps-9',
										'aria-label': 'Select database',
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root();
											var div = $.first_child(fragment_6);
											var node_4 = $.child(div);

											Database(node_4, { size: 16, 'aria-hidden': 'true' });
											$.reset(div);

											var text_1 = $.sibling(div);

											$.template_effect(() => $.set_text(text_1, ` ${$.get(selectedItem)?.label ?? 'Select database' ?? ''}`));
											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});

									var node_5 = $.sibling(node_3, 2);

									SelectContent(node_5, {
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = $.comment();
											var node_6 = $.first_child(fragment_7);

											$.each(node_6, 17, () => items, (item) => item.value, ($$anchor, item) => {
												SelectItem($$anchor, {
													get value() {
														return $.get(item).value;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text();

														$.template_effect(() => $.set_text(text_2, $.get(item).label));
														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
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
}