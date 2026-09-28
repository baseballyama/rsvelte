import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 class="svelte-1gf8gw7">test</h1>`);
var root_1 = $.from_html(`<!> <span class="svelte-1gf8gw7">Hello</span>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, ($$anchor) => {
		var h1 = root();

		$.append($$anchor, h1);
	});

	$.next(2);
	$.append($$anchor, fragment);
}