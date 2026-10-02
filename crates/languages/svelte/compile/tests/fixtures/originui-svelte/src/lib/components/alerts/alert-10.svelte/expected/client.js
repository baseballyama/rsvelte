import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowRight from '@lucide/svelte/icons/arrow-right';
import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

var root = $.from_html(`<div class="rounded-lg border border-amber-500/50 px-4 py-3 text-amber-600"><div class="flex gap-3"><!> <div class="flex grow justify-between gap-3"><p class="text-sm">Some information is missing!</p> <a href="#title" class="group text-sm font-medium whitespace-nowrap">Link<!></a></div></div></div>`);

export default function Alert_10($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	TriangleAlert(node, {
		class: 'mt-0.5 shrink-0 opacity-60',
		size: 16,
		'aria-hidden': 'true'
	});

	var div_2 = $.sibling(node, 2);
	var a = $.sibling($.child(div_2), 2);
	var node_1 = $.sibling($.child(a));

	ArrowRight(node_1, {
		class: 'ms-1 -mt-0.5 inline-flex opacity-60 transition-transform group-hover:translate-x-0.5',
		size: 16,
		'aria-hidden': 'true'
	});

	$.reset(a);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}