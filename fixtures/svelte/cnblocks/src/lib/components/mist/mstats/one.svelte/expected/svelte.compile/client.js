import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Card from "$lib/components/ui/card/card.svelte";

var root = $.from_html(`<div><div class="space-y-1 text-4xl font-bold text-foreground">+1200</div> <p class="text-muted-foreground">Stars on GitHub</p></div> <div><div class="space-y-1 text-4xl font-bold text-foreground">56%</div> <p class="text-muted-foreground">Conversion rate</p></div> <div><div class="space-y-1 text-4xl font-bold text-foreground">+500</div> <p class="text-muted-foreground">Powered Apps</p></div>`, 1);
var root_1 = $.from_html(`<section class="bg-muted py-12 md:py-20 dark:[--color-muted:var(--color-zinc-900)]"><div class="mx-auto max-w-5xl px-6"><!></div></section>`);

export default function One($$anchor) {
	var section = root_1();
	var div = $.child(section);
	var node = $.child(div);

	Card(node, {
		class: 'grid gap-0.5 divide-y *:py-8 *:text-center md:grid-cols-3 md:divide-x md:divide-y-0',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();

			$.next(4);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}