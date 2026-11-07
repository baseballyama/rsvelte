import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export const { data, errors } = { data: {}, errors: {} };

export default function _page($$anchor) {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${data ?? ''}, ${errors ?? ''}`));
	$.append($$anchor, text);
}