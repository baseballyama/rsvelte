import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<div><!></div>`);

export default function Component($$anchor, $$props) {
	const props = $.rest_props($$props, rest_excludes);
	var div = root();

	$.attribute_effect(div, () => ({ ...props }));

	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);

	$.event('click', div, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.append($$anchor, div);
}