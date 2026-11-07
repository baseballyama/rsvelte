import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CircleAlert from '@lucide/svelte/icons/circle-alert';

var root = $.from_html(`<div class="rounded-lg border border-red-500/50 px-4 py-3 text-red-600"><div class="flex gap-3"><!> <div class="grow space-y-1"><p class="text-sm font-medium">Password does not meet requirements:</p> <ul class="list-inside list-disc text-sm opacity-80"><li>Minimum 8 characters</li> <li>Inlcude a special character</li></ul></div></div></div>`);

export default function Alert_12($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	CircleAlert(node, {
		class: 'mt-0.5 shrink-0 opacity-60',
		size: 16,
		'aria-hidden': 'true'
	});

	$.next(2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}