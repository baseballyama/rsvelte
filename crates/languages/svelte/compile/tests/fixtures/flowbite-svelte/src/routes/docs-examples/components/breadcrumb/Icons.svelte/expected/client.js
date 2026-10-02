import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";
import { HomeOutline, ChevronDoubleRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Icons($$anchor) {
	Breadcrumb($$anchor, {
		'aria-label': 'Solid background breadcrumb example',
		class: 'bg-gray-50 px-5 py-3 dark:bg-gray-900',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			{
				const icon = ($$anchor) => {
					HomeOutline($$anchor, { class: 'me-2 h-4 w-4' });
				};

				BreadcrumbItem(node, {
					href: '/',
					home: true,
					icon,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Home');

						$.append($$anchor, text);
					},
					$$slots: { icon: true, default: true }
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				const icon = ($$anchor) => {
					ChevronDoubleRightOutline($$anchor, { class: 'mx-2 h-5 w-5 dark:text-white' });
				};

				BreadcrumbItem(node_1, {
					href: '/',
					icon,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Projects');

						$.append($$anchor, text_1);
					},
					$$slots: { icon: true, default: true }
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				const icon = ($$anchor) => {
					ChevronDoubleRightOutline($$anchor, { class: 'mx-2 h-5 w-5 dark:text-white' });
				};

				BreadcrumbItem(node_2, {
					icon,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Flowbite Svelte');

						$.append($$anchor, text_2);
					},
					$$slots: { icon: true, default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}