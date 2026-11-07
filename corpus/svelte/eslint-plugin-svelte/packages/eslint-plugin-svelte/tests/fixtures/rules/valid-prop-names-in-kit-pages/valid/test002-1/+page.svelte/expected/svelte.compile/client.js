import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export let data;
export let errors;
export let foo;
export let bar;

export default function _page($$anchor) {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${data ?? ''}, ${errors ?? ''}, ${foo ?? ''}, ${bar ?? ''}`));
	$.append($$anchor, text);
}