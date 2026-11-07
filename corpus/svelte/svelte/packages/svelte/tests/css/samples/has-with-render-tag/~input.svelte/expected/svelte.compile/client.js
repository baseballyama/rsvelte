import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const foo = ($$anchor) => {
	var y = root();

	$.append($$anchor, y);
};

var root = $.from_html(`<y class="svelte-31blhk"></y>`);
var root_1 = $.from_html(`<x class="svelte-31blhk">this should be green <!></x> <z><p class="svelte-31blhk">this should be green</p> <!></z>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var x = $.first_child(fragment);
	var node = $.sibling($.child(x));

	foo(node);
	$.reset(x);

	var z = $.sibling(x, 2);
	var node_1 = $.sibling($.child(z), 2);

	foo(node_1);
	$.reset(z);
	$.append($$anchor, fragment);
}