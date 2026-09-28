import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CircleCheck from '@lucide/svelte/icons/circle-check';

var root = $.from_html(`<div class="border-border rounded-lg border px-4 py-3"><p class="text-sm"><!>Completed successfully!</p></div>`);

export default function Alert_05($$anchor) {
	var div = root();
	var p = $.child(div);
	var node = $.child(p);

	CircleCheck(node, {
		class: 'me-3 -mt-0.5 inline-flex text-emerald-500',
		size: 16,
		'aria-hidden': 'true'
	});

	$.next();
	$.reset(p);
	$.reset(div);
	$.append($$anchor, div);
}