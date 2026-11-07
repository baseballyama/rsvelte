import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function A($$anchor) {
	$.next();

	var text = $.text('A');

	$.append($$anchor, text);
}