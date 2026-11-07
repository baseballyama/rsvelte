import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div role="tooltip"></div> <div role="button tooltip"></div> <div role="toooltip"></div> <div role="button toooltip"></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}