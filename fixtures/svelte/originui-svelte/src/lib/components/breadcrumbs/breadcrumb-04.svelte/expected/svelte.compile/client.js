import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from '@lucide/svelte/icons/component';
import Home from '@lucide/svelte/icons/home';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '$lib/components/ui/breadcrumb';

var root = $.from_html(`<!> Home`, 1);
var root_1 = $.from_html(`<!> Components`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Breadcrumb_04($$anchor) {
	Breadcrumb($$anchor, {
		children: ($$anchor, $$slotProps) => {
			BreadcrumbList($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_2();
					var node = $.first_child(fragment_2);

					BreadcrumbItem(node, {
						children: ($$anchor, $$slotProps) => {
							BreadcrumbLink($$anchor, {
								href: '#title',
								class: 'inline-flex items-center gap-1.5',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_1 = $.first_child(fragment_4);

									Home(node_1, { size: 16, 'aria-hidden': 'true' });
									$.next();
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node, 2);

					BreadcrumbSeparator(node_2, {});

					var node_3 = $.sibling(node_2, 2);

					BreadcrumbItem(node_3, {
						children: ($$anchor, $$slotProps) => {
							BreadcrumbLink($$anchor, {
								href: '#title',
								class: 'inline-flex items-center gap-1.5',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_1();
									var node_4 = $.first_child(fragment_6);

									Component(node_4, { size: 16, 'aria-hidden': 'true' });
									$.next();
									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_3, 2);

					BreadcrumbSeparator(node_5, {});

					var node_6 = $.sibling(node_5, 2);

					BreadcrumbItem(node_6, {
						children: ($$anchor, $$slotProps) => {
							BreadcrumbPage($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Breadcrumb');

									$.append($$anchor, text);
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