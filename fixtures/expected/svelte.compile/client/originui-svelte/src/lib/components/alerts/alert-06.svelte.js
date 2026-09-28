import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CircleCheck from '@lucide/svelte/icons/circle-check';

var root = $.from_html(`<div class="rounded-lg border border-emerald-500/50 px-4 py-3 text-emerald-600"><p class="text-sm"><!>Completed successfully!</p></div>`);

export default function Alert_06($$anchor) {
	var div = root();
	var p = $.child(div);
	var node = $.child(p);

	CircleCheck(node, {
		class: 'me-3 -mt-0.5 inline-flex opacity-60',
		size: 16,
		'aria-hidden': 'true'
	});

	$.next();
	$.reset(p);
	$.reset(div);
	$.append($$anchor, div);
}