import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const sum = ($$anchor, a = $.noop, b = $.noop) => {
	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `${a() ?? ''} + ${b() ?? ''} = ${a() + b()}`));
	$.append($$anchor, p);
};

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	sum(node, () => 1, () => 2);

	var node_1 = $.sibling(node, 2);

	sum(node_1, () => 3, () => 4);

	var node_2 = $.sibling(node_1, 2);

	sum(node_2, () => 5, () => 6);
	$.append($$anchor, fragment);
}