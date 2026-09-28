import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<h2><!></h2>`);

export default function H2($$anchor, $$props) {
	const rest = $.rest_props($$props, rest_excludes);
	var h2 = root();

	$.attribute_effect(h2, () => ({ class: 'h2', ...rest }));

	var node = $.child(h2);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h2);
	$.append($$anchor, h2);
}