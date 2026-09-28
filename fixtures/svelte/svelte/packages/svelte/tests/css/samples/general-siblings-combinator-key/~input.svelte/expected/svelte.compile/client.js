import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="b svelte-1y4h2no"></div>`);
var root_1 = $.from_html(`<div class="a svelte-1y4h2no"></div> <!> <div class="c svelte-1y4h2no"></div>`, 1);

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