import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';

var root = $.from_html(`<div class="w-full space-y-8"><div class="card preset-outlined-success-500 grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[1fr_auto]"><div><p class="font-bold">Success</p> <p class="text-xs opacity-60">The task has been completed successfully.</p></div> <div class="flex gap-1"><button class="btn preset-tonal hover:preset-filled">Dismiss</button></div></div> <div class="card preset-outlined-warning-500 grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[auto_1fr_auto]"><!> <div><p class="font-bold">Warning</p> <p class="text-xs opacity-60">Beware of this important notice.</p></div> <div class="flex gap-1"><button class="btn preset-tonal hover:preset-filled">Dismiss</button></div></div> <div class="card preset-outlined-error-500 grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[auto_1fr_auto]"><!> <div><p class="font-bold">Error</p> <p class="text-xs opacity-60">Something has gone wrong.</p></div> <div class="flex gap-1"><button class="btn preset-tonal hover:preset-filled">Dismiss</button></div></div></div>`);

export default function Colors($$anchor) {
	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	TriangleAlertIcon(node, {});
	$.next(4);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	TriangleAlertIcon(node_1, {});
	$.next(4);
	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
}