import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Breadcrumb from "carbon-components-svelte/Breadcrumb/Breadcrumb.svelte";
import BreadcrumbItem from "carbon-components-svelte/Breadcrumb/BreadcrumbItem.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Breadcrumb_noTrailingSlash_test($$anchor) {
	Breadcrumb($$anchor, {
		noTrailingSlash: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			BreadcrumbItem(node, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Home');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			BreadcrumbItem(node_1, {
				href: '/profile',
				isCurrentPage: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Profile');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}