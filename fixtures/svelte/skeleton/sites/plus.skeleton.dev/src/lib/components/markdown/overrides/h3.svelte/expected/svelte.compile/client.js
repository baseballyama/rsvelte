import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<h3><!></h3>`);

export default function H3($$anchor, $$props) {
	const rest = $.rest_props($$props, rest_excludes);
	var h3 = root();

	$.attribute_effect(h3, () => ({ class: 'h3', ...rest }));

	var node = $.child(h3);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h3);
	$.append($$anchor, h3);
}