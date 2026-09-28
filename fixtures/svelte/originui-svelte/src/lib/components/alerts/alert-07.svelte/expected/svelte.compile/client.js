import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Info from '@lucide/svelte/icons/info';

var root = $.from_html(`<div class="border-border rounded-lg border px-4 py-3"><p class="text-sm"><!>Just a quick
		note!</p></div>`);

export default function Alert_07($$anchor) {
	var div = root();
	var p = $.child(div);
	var node = $.child(p);

	Info(node, {
		class: 'me-3 -mt-0.5 inline-flex text-blue-500',
		size: 16,
		'aria-hidden': 'true'
	});

	$.next();
	$.reset(p);
	$.reset(div);
	$.append($$anchor, div);
}