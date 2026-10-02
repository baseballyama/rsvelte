import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Info from '@lucide/svelte/icons/info';

var root = $.from_html(`<div class="rounded-lg border border-blue-500/50 px-4 py-3 text-blue-600"><p class="text-sm"><!>Just a quick
		note!</p></div>`);

export default function Alert_08($$anchor) {
	var div = root();
	var p = $.child(div);
	var node = $.child(p);

	Info(node, {
		class: 'me-3 -mt-0.5 inline-flex opacity-60',
		size: 16,
		'aria-hidden': 'true'
	});

	$.next();
	$.reset(p);
	$.reset(div);
	$.append($$anchor, div);
}