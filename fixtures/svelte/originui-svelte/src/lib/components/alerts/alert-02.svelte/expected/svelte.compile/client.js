import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

var root = $.from_html(`<div class="rounded-lg border border-amber-500/50 px-4 py-3 text-amber-600"><p class="text-sm"><!>Some
		information is missing!</p></div>`);

export default function Alert_02($$anchor) {
	var div = root();
	var p = $.child(div);
	var node = $.child(p);

	TriangleAlert(node, {
		class: 'me-3 -mt-0.5 inline-flex opacity-60',
		size: 16,
		'aria-hidden': 'true'
	});

	$.next();
	$.reset(p);
	$.reset(div);
	$.append($$anchor, div);
}