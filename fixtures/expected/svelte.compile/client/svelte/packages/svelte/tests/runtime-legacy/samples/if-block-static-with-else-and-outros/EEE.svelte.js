import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function EEE($$anchor) {
	$.next();

	var text = $.text('eee');

	$.append($$anchor, text);
}