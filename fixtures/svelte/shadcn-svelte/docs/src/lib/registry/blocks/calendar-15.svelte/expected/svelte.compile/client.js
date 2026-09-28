import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Construction from "@lucide/svelte/icons/construction";

var root = $.from_html(`<div class="flex h-full flex-col items-center justify-center gap-4"><!> <span>This block is under construction. Check back soon!</span></div>`);

export default function Calendar_15($$anchor) {
	var div = root();
	var node = $.child(div);

	Construction(node, { class: 'size-10' });
	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}