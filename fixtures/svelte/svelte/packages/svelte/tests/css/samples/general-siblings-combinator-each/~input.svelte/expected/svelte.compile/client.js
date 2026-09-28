import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="each svelte-qv9m76"></span> <div class="each svelte-qv9m76"></div> <span class="each svelte-qv9m76"></span> <div class="each svelte-qv9m76"></div>`, 1);
var root_1 = $.from_html(`<div class="svelte-qv9m76"></div> <!> <span class="svelte-qv9m76"></span>`, 1);

export default function Input($$anchor) {
	let array = [1];
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	$.each(node, 17, () => array, $.index, ($$anchor, item) => {
		var fragment_1 = root();

		$.next(6);
		$.append($$anchor, fragment_1);
	});

	$.next(2);
	$.append($$anchor, fragment);
}