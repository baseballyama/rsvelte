import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<h1><!></h1>`);

export default function H1($$anchor, $$props) {
	const rest = $.rest_props($$props, rest_excludes);
	var h1 = root();

	$.attribute_effect(h1, () => ({ class: 'h1', ...rest }));

	var node = $.child(h1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h1);
	$.append($$anchor, h1);
}