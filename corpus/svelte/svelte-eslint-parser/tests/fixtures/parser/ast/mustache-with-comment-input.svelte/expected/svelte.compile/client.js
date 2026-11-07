import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Mustache_with_comment_input($$anchor) {
	$.next();

	var text = $.text();

	text.nodeValue = foo();
	$.append($$anchor, text);
}