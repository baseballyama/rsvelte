import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const a = ($$anchor) => {
	var fragment = root();
	var node = $.first_child(fragment);

	b(node);

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	b(node_1);
	$.reset(div);
	$.append($$anchor, fragment);
};

const b = ($$anchor) => {
	var fragment_1 = root();
	var node_2 = $.first_child(fragment_1);

	a(node_2);

	var div_1 = $.sibling(node_2, 2);
	var node_3 = $.child(div_1);

	a(node_3);
	$.reset(div_1);
	$.append($$anchor, fragment_1);
};

const c = ($$anchor) => {
	var fragment_2 = root_1();
	var node_4 = $.sibling($.first_child(fragment_2), 2);

	c(node_4);
	$.append($$anchor, fragment_2);
};

var root = $.from_html(`<!> <div class="svelte-1tmf9qf"><!></div>`, 1);
var root_1 = $.from_html(`<span class="svelte-1tmf9qf"></span> <!>`, 1);

export default function Input($$anchor) {}