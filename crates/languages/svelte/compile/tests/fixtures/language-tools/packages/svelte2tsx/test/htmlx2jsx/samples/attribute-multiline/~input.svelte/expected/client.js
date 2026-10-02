import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`<!> <!> <!> <div multilineattr="hello
world"></div> <div multilineattr="he\`llo
world"></div> <div></div>`,
	1
);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Comp(node, { multilineattr: 'hello\nworld' });

	var node_1 = $.sibling(node, 2);

	Comp(node_1, { multilineattr: 'he`llo\nworld' });

	var node_2 = $.sibling(node_1, 2);

	Comp(node_2, {
		multilineattr: `
color: ${color ?? ''}
display: block`
	});

	var div = $.sibling(node_2, 6);

	$.set_attribute(div, 'multilineattr', `
color: ${color ?? ''}
display: block`);

	$.append($$anchor, fragment);
}