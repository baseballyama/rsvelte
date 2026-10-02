import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';

var root = $.from_html(`<section class="border-border relative isolate overflow-hidden border-t"><div class="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24"><div class="relative"><div class="bg-svelte/15 absolute top-0 left-32 size-28 rounded-full blur-2xl"></div> <div class="bg-svelte/15 absolute right-32 bottom-0 size-44 rounded-full blur-2xl"></div> <div class="relative z-10 text-center"><h2 class="font-heading text-foreground mb-4 font-serif text-3xl/[1.1] tracking-tight text-balance md:text-4xl/[1.1]"><span class="block">Discover/Contribute</span></h2> <p class="text-muted-foreground mx-auto max-w-xl text-base text-balance">Explore the original Origin UI or contribute by suggesting new components and
					improvements.</p> <div class="mt-8 flex flex-wrap items-center justify-center gap-4"><!> <!></div></div></div></div></section>`);

export default function Cta($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 4);
	var div_3 = $.sibling($.child(div_2), 4);
	var node = $.child(div_3);

	Button(node, {
		variant: 'secondary',
		href: 'https://originui.com/',
		target: '_blank',
		rel: 'noopener noreferrer',
		'aria-label': 'Send a suggestion to the Origin UI - Svelte repository',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Visit Original');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		href: 'https://github.com/max-got/originui-svelte/discussions',
		target: '_blank',
		rel: 'noopener noreferrer',
		'aria-label': 'Visit the original Origin UI website',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Send Suggestion');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}