import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { List, Li, A } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Horizontal($$anchor) {
	List($$anchor, {
		tag: 'dl',
		class: 'mb-6 flex flex-wrap items-center justify-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Li(node, {
				children: ($$anchor, $$slotProps) => {
					A($$anchor, {
						href: '/',
						class: 'me-4 text-gray-700 hover:underline md:me-6 dark:text-white',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('About');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Li(node_1, {
				children: ($$anchor, $$slotProps) => {
					A($$anchor, {
						href: '/',
						class: 'me-4 text-gray-700 hover:underline md:me-6 dark:text-white',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Premium');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Li(node_2, {
				children: ($$anchor, $$slotProps) => {
					A($$anchor, {
						href: '/',
						class: 'me-4 text-gray-700 hover:underline md:me-6 dark:text-white',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Campaigns');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Li(node_3, {
				children: ($$anchor, $$slotProps) => {
					A($$anchor, {
						href: '/',
						class: 'me-4 text-gray-700 hover:underline md:me-6 dark:text-white',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Blog');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Li(node_4, {
				children: ($$anchor, $$slotProps) => {
					A($$anchor, {
						href: '/',
						class: 'me-4 text-gray-700 hover:underline md:me-6 dark:text-white',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Affiliate Program');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Li(node_5, {
				children: ($$anchor, $$slotProps) => {
					A($$anchor, {
						href: '/',
						class: 'me-4 text-gray-700 hover:underline md:me-6 dark:text-white',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('FAQs');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}