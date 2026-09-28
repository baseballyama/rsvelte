import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<button><!></button>`);

export default function Button($$anchor, $$props) {
	const props = $.rest_props($$props, rest_excludes);
	var button = root();

	$.attribute_effect(button, () => ({ ...props }));

	var node = $.child(button);

	$.snippet(node, () => $$props.children);
	$.reset(button);

	$.event('click', button, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.append($$anchor, button);
}