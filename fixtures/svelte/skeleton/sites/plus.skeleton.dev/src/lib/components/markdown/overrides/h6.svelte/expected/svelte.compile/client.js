import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<h6><!></h6>`);

export default function H6($$anchor, $$props) {
	const rest = $.rest_props($$props, rest_excludes);
	var h6 = root();

	$.attribute_effect(h6, () => ({ class: 'h6', ...rest }));

	var node = $.child(h6);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h6);
	$.append($$anchor, h6);
}