import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Eclipse from '@lucide/svelte/icons/eclipse';

var root = $.from_html(`<div class="dark bg-muted text-foreground px-4 py-3"><p class="text-center text-sm"><!>Get the most
		out of your app with real-time updates and analytics <span class="text-muted-foreground">·</span> <a href="#title" class="font-medium underline hover:no-underline">Upgrade</a></p></div>`);

export default function Banner_03($$anchor) {
	var div = root();
	var p = $.child(div);
	var node = $.child(p);

	Eclipse(node, {
		class: 'me-3 -mt-0.5 inline-flex opacity-60',
		size: 16,
		'aria-hidden': 'true'
	});

	$.next(4);
	$.reset(p);
	$.reset(div);
	$.append($$anchor, div);
}