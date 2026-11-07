import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function RRR($$anchor) {
	$.next();

	var text = $.text('rrr');

	$.append($$anchor, text);
}