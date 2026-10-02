import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="text-sm text-muted-foreground">Enter your email address.</p>`);

export default function Typography_muted($$anchor) {
	var p = root();

	$.append($$anchor, p);
}