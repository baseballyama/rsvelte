import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 class="svelte-16050j7">Testing Styles</h1> <h2 class="svelte-16050j7">Testing Styles 2</h2> <div class="svelte-16050j7">Testing Styles 3</div>`, 1);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const b = 2;
	var $$exports = { b };
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}