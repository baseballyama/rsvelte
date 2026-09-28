import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _page($$anchor) {
	$.next();

	var text = $.text('1<2');

	$.append($$anchor, text);
}