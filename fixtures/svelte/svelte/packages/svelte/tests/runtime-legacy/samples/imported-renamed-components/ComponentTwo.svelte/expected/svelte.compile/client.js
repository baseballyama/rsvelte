import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function ComponentTwo($$anchor) {
	$.next();

	var text = $.text('Two');

	$.append($$anchor, text);
}