import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const f = ($$anchor) => {
	$.next();

	var text = $.text();

	text.nodeValue = location.href;
	$.append($$anchor, text);
};

export default function In_template02_input($$anchor) {}