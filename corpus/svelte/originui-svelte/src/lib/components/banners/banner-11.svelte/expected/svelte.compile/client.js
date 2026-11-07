import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="border-border border-b px-4 py-3"><p class="text-center text-sm"><span class="mr-1 text-base leading-none">📫</span> Subscribe to our newsletter and get 10% off
		your first order! <span class="text-muted-foreground mx-1">·</span> <a href="#title" class="font-medium underline hover:no-underline">Subscribe</a></p></div>`);

export default function Banner_11($$anchor) {
	var div = root();

	$.append($$anchor, div);
}