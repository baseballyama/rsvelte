import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<h4><!></h4>`);

export default function H4($$anchor, $$props) {
	const rest = $.rest_props($$props, rest_excludes);
	var h4 = root();

	$.attribute_effect(h4, () => ({ class: 'h4', ...rest }));

	var node = $.child(h4);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h4);
	$.append($$anchor, h4);
}