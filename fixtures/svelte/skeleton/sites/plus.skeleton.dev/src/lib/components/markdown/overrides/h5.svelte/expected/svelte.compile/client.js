import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<h5><!></h5>`);

export default function H5($$anchor, $$props) {
	const rest = $.rest_props($$props, rest_excludes);
	var h5 = root();

	$.attribute_effect(h5, () => ({ class: 'h5', ...rest }));

	var node = $.child(h5);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h5);
	$.append($$anchor, h5);
}