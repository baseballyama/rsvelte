import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Footer, FooterCopyright, FooterLinkGroup, FooterLink } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Default($$anchor) {
	Footer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			FooterCopyright(node, { href: '/', by: 'Flowbite™', year: 2022 });

			var node_1 = $.sibling(node, 2);

			FooterLinkGroup(node_1, {
				class: 'mt-3 flex flex-wrap items-center text-sm text-gray-500 sm:mt-0 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					FooterLink(node_2, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('About');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					FooterLink(node_3, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Privacy Policy');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					FooterLink(node_4, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Licensing');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					FooterLink(node_5, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Contact');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}