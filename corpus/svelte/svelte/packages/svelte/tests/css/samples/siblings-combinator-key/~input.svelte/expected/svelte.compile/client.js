import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="b svelte-c0rrfb"></div>`);
var root_1 = $.from_html(`<div class="a svelte-c0rrfb"></div> <!> <div class="c svelte-c0rrfb"></div>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	$.key(node, () => x, ($$anchor) => {
		var div = root();

		$.append($$anchor, div);
	});

	$.next(2);
	$.append($$anchor, fragment);
}