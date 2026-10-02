import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import { seoMetaTags } from "$lib/config/seo";
import { MetaTags } from "svelte-meta-tags";

var root = $.from_html(`<!> <section><div class="mx-4 max-w-7xl border-x border-b px-8 py-16 [--color-border:color-mix(in_oklab,var(--color-zinc-200)_75%,transparent)] md:mx-auto dark:[--color-border:color-mix(in_oklab,var(--color-zinc-800)_60%,transparent)]"><div class="max-w-2xl"><h1 class="text-3xl font-bold text-balance sm:text-4xl">Veil Blocks</h1> <p class="mt-3 mb-6 text-base text-muted-foreground">Modern marketing and UI blocks for Svelte, designed with the Veil visual style.</p> <div class="flex flex-wrap items-center gap-2 sm:space-x-2"><!> <!></div></div></div></section>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	MetaTags(node, $.spread_props(() => seoMetaTags, { title: 'Veil Blocks' }));

	var section = $.sibling(node, 2);
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 4);
	var node_1 = $.child(div_2);

	Button(node_1, {
		href: '/veil/hero',
		class: 'w-full sm:w-fit',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Get Started');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		href: '/docs/installation',
		variant: 'outline',
		class: 'w-full sm:w-fit',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Visit Docs');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, fragment);
}