import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function IconA($$anchor) {
	$.next();

	var text = $.text('Icon A');

	$.append($$anchor, text);
}