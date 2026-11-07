import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export const { data2: data, errors2: errors } = { data2: {}, errors2: {} };

export default function _page($$anchor) {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${data ?? ''}, ${errors ?? ''}`));
	$.append($$anchor, text);
}