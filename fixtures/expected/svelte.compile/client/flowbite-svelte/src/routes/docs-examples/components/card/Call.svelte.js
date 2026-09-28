import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, Button, Rating, Badge } from "flowbite-svelte";

var root = $.from_html(`<a href="/"><img class="rounded-t-lg p-8" src="/images/product-1.webp" alt="product 1"/></a> <div class="px-5 pb-5"><a href="/"><h5 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Apple Watch Series 7 GPS, Aluminium Case, Starlight Sport</h5></a> <!> <div class="flex items-center justify-between"><span class="text-3xl font-bold text-gray-900 dark:text-white">$599</span> <!></div></div>`, 1);

export default function Call($$anchor) {
	Card($$anchor, {
		class: 'p-0',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.sibling($.first_child(fragment_1), 2);
			var node = $.sibling($.child(div), 2);

			{
				const text = ($$anchor) => {
					Badge($$anchor, {
						class: 'ms-3',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('4');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				};

				Rating(node, {
					rating: 4,
					size: 24,
					class: 'mt-2.5 mb-5',
					text,
					$$slots: { text: true }
				});
			}

			var div_1 = $.sibling(node, 2);
			var node_1 = $.sibling($.child(div_1), 2);

			Button(node_1, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Buy now');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}