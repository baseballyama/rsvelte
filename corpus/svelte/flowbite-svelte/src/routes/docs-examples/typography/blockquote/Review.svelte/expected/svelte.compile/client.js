import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Blockquote, Rating } from "flowbite-svelte";

var root = $.from_html(`<figure class="max-w-(--breakpoint-md)"><div class="mb-4 flex items-center text-yellow-300"><!></div> <!> <figcaption class="mt-6 flex items-center space-x-3 rtl:space-x-reverse"><img class="h-6 w-6 rounded-full" src="/images/blocks/marketing-ui/avatars/bonnie-green.png" alt="Bonnie Green profile"/> <div class="flex items-center divide-x-2 divide-gray-300 rtl:divide-x-reverse dark:divide-gray-700"><cite class="pe-3 font-medium text-gray-900 dark:text-white">Bonnie Green</cite> <cite class="ps-3 text-sm font-light text-gray-500 dark:text-gray-400">CTO at Flowbite</cite></div></figcaption></figure>`);

export default function Review($$anchor) {
	var figure = root();
	var div = $.child(figure);
	var node = $.child(div);

	Rating(node, { total: 5, rating: 4.66, size: 24 });
	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Blockquote(node_1, {
		italic: false,
		size: '2xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('"Flowbite is just awesome. It contains tons of predesigned components and pages starting from login screen to complex dashboard. Perfect choice for your next SaaS application."');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(figure);
	$.append($$anchor, figure);
}