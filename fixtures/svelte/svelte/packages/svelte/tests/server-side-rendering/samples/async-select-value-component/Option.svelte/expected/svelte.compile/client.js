import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<option><!></option>`);

export default function Option($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);
	var option = root();

	$.attribute_effect(option, () => ({ ...props }));

	$.customizable_select(option, () => {
		var anchor = $.child(option);
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.snippet(node, () => $$props.children ?? $.noop);
		$.append(anchor, fragment);
	});

	$.append($$anchor, option);
	$.pop();
}