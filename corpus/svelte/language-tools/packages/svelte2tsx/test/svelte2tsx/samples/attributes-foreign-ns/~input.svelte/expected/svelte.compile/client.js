import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<element someattr="hi" someotherattribute="there">hello</element> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	Component(node, { someAttr: '5', otherAttr: 6 });
	$.append($$anchor, fragment);
}