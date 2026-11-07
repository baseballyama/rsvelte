import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _layout($$anchor) {
	$.next();

	var text = $.text('export function load() {}');

	$.append($$anchor, text);
}