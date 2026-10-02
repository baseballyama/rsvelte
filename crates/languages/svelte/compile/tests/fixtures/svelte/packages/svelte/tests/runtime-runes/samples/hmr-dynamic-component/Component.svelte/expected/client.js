import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Component($$anchor) {
	$.next();

	var text = $.text('component');

	$.append($$anchor, text);
}