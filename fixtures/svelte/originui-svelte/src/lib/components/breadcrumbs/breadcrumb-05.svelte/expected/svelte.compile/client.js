import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Home from '@lucide/svelte/icons/home';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '$lib/components/ui/breadcrumb';

var root = $.from_html(`<!> <span class="sr-only">Home</span>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Breadcrumb_05($$anchor) {
	Breadcrumb($$anchor, {
		children: ($$anchor, $$slotProps) => {
			BreadcrumbList($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node = $.first_child(fragment_2);

					BreadcrumbItem(node, {
						children: ($$anchor, $$slotProps) => {
							BreadcrumbLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_1 = $.first_child(fragment_4);

									Home(node_1, { size: 16, 'aria-hidden': 'true' });
									$.next(2);
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node, 2);

					BreadcrumbSeparator(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('/');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					BreadcrumbItem(node_3, {
						children: ($$anchor, $$slotProps) => {
							BreadcrumbLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Components');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					BreadcrumbSeparator(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('/');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					BreadcrumbItem(node_5, {
						children: ($$anchor, $$slotProps) => {
							BreadcrumbPage($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Breadcrumb');

									$.append($$anchor, text_3);
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