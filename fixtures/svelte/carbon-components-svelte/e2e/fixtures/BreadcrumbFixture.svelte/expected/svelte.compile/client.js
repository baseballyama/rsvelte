import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Breadcrumb, BreadcrumbItem } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function BreadcrumbFixture($$anchor) {
	Breadcrumb($$anchor, {
		'data-testid': 'breadcrumb',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			BreadcrumbItem(node, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Dashboard');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			BreadcrumbItem(node_1, {
				href: '/reports',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Annual reports');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			BreadcrumbItem(node_2, {
				href: '/reports/2019',
				isCurrentPage: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('2019');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}