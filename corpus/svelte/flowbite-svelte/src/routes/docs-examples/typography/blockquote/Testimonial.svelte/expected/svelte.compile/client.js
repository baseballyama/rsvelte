import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Blockquote } from "flowbite-svelte";
import { QuoteSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<figure class="mx-auto max-w-(--breakpoint-md) text-center"><!> <!> <figcaption class="mt-6 flex items-center justify-center space-x-3 rtl:space-x-reverse"><img class="h-6 w-6 rounded-full" src="/images/blocks/marketing-ui/avatars/michael-gouch.png" alt="Micheal Gough profile"/> <div class="flex items-center divide-x-2 divide-gray-500 rtl:divide-x-reverse dark:divide-gray-700"><cite class="pe-3 font-medium text-gray-900 dark:text-white">Micheal Gough</cite> <cite class="ps-3 text-sm font-light text-gray-500 dark:text-gray-400">CEO at Google</cite></div></figcaption></figure>`);

export default function Testimonial($$anchor) {
	var figure = root();
	var node = $.child(figure);

	QuoteSolid(node, {
		class: 'mx-auto mb-3 h-12 w-12 text-gray-400 dark:text-gray-600'
	});

	var node_1 = $.sibling(node, 2);

	Blockquote(node_1, {
		alignment: 'center',
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