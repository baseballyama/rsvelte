import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Widget($$anchor) {
	$.next();

	var text = $.text('Foo');

	$.append($$anchor, text);
}