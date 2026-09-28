import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const foo = ($$anchor) => {
	var p = root();

	$.append($$anchor, p);
};

var root = $.from_html(`<p class="svelte-1tyycfi">this should be green</p>`);
var root_1 = $.from_html(`<h1 class="svelte-1tyycfi">Hello</h1> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	foo(node);
	$.append($$anchor, fragment);
}