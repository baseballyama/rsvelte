import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Foo($$anchor, $$props) {
	$.push($$props, true);

	const test = true;
	var $$exports = { test };

	$.next();

	var text = $.text('Foo');

	$.append($$anchor, text);

	return $.pop($$exports);
}