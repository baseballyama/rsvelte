import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Widget($$anchor) {
	$.next();

	var text = $.text('Hello World!');

	$.append($$anchor, text);
}