import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CircleAlert from '@lucide/svelte/icons/circle-alert';

var root = $.from_html(`<div class="border-border rounded-lg border px-4 py-3"><p class="text-sm"><!>An
		error occurred!</p></div>`);

export default function Alert_03($$anchor) {
	var div = root();
	var p = $.child(div);
	var node = $.child(p);

	CircleAlert(node, {
		class: 'me-3 -mt-0.5 inline-flex text-red-500',
		size: 16,
		'aria-hidden': 'true'
	});

	$.next();
	$.reset(p);
	$.reset(div);
	$.append($$anchor, div);
}