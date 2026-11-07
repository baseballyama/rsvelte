import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowRight from '@lucide/svelte/icons/arrow-right';
import Eclipse from '@lucide/svelte/icons/eclipse';

var root = $.from_html(`<div class="dark bg-muted text-foreground px-4 py-3"><div class="flex flex-col justify-between gap-2 md:flex-row"><div class="flex grow gap-3"><!> <div class="flex grow flex-col justify-between gap-2 md:flex-row md:items-center"><p class="text-sm">We just added something awesome to make your experience even better.</p> <a href="#title" class="group text-sm font-medium whitespace-nowrap">Learn more<!></a></div></div></div></div>`);

export default function Banner_04($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Eclipse(node, {
		class: 'mt-0.5 shrink-0 opacity-60',
		size: 16,
		'aria-hidden': 'true'
	});

	var div_3 = $.sibling(node, 2);
	var a = $.sibling($.child(div_3), 2);
	var node_1 = $.sibling($.child(a));

	ArrowRight(node_1, {
		class: 'ms-1 -mt-0.5 inline-flex opacity-60 transition-transform group-hover:translate-x-0.5',
		size: 16,
		'aria-hidden': 'true'
	});

	$.reset(a);
	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}