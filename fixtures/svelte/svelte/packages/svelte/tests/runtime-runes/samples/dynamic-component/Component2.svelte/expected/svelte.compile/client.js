import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Component2($$anchor) {
	$.next();

	var text = $.text('Component2');

	$.append($$anchor, text);
}