import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="text-xl text-muted-foreground">A modal dialog that interrupts the user with important content and expects a response.</p>`);

export default function Typography_lead($$anchor) {
	var p = root();

	$.append($$anchor, p);
}