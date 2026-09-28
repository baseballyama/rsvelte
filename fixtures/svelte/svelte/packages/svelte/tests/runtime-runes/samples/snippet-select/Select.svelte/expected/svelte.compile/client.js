import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<select><!></select>`);

export default function Select($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var select = root();

	$.attribute_effect(select, () => ({ name: 'pets', id: 'pet-select1', ...rest }));

	$.customizable_select(select, () => {
		var anchor = $.child(select);
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.snippet(node, () => $$props.children);
		$.append(anchor, fragment);
	});

	$.append($$anchor, select);
}