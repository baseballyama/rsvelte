import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Default($$anchor) {
	Breadcrumb($$anchor, {
		'aria-label': 'Default breadcrumb example',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			BreadcrumbItem(node, {
				href: '/',
				home: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Home');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			BreadcrumbItem(node_1, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Projects');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			BreadcrumbItem(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Flowbite Svelte');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}