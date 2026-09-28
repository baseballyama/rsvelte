import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";
import MetaTag from "../../../utils/MetaTag.svelte";
import { Playground } from "flowbite-svelte-admin-dashboard";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div id="main-content" class="relative mx-auto h-full w-full max-w-screen-2xl overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900"><!></div>`, 1);

export default function _page($$anchor) {
	const path = "/playground/stacked";
	const description = "Playground stacked example - Flowbite Svelte Admin Dashboard";
	const metaTitle = "Flowbite Svelte Admin Dashboard - Playground stacked";
	const subtitle = "Playground stacked";
	var fragment = root_1();
	var node = $.first_child(fragment);

	MetaTag(node, { path, description, title: metaTitle, subtitle });

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	{
		const breadcrumb = ($$anchor) => {
			Breadcrumb($$anchor, {
				class: 'mb-5',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					BreadcrumbItem(node_2, {
						href: '/',
						home: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Home');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					BreadcrumbItem(node_3, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Playground');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					BreadcrumbItem(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Stacked');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		Playground(node_1, {
			title: 'Create something awesome here',
			breadcrumb,
			$$slots: { breadcrumb: true }
		});
	}

	$.reset(div);
	$.append($$anchor, fragment);
}