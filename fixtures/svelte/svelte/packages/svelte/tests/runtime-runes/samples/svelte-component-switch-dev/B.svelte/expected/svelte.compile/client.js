import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function B($$anchor) {
	$.next();

	var text = $.text('B');

	$.append($$anchor, text);
}