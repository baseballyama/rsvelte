import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowRight from '@lucide/svelte/icons/arrow-right';

var root = $.from_html(`<div class="dark bg-muted text-foreground px-4 py-3"><p class="flex justify-center text-sm"><a href="#title" class="group"><span class="me-1 text-base leading-none">✨</span>Introducing transactional and marketing
			emails <!></a></p></div>`);

export default function Banner_02($$anchor) {
	var div = root();
	var p = $.child(div);
	var a = $.child(p);
	var node = $.sibling($.child(a), 2);

	ArrowRight(node, {
		class: 'ms-2 -mt-0.5 inline-flex opacity-60 transition-transform group-hover:translate-x-0.5',
		size: 16,
		'aria-hidden': 'true'
	});

	$.reset(a);
	$.reset(p);
	$.reset(div);
	$.append($$anchor, div);
}