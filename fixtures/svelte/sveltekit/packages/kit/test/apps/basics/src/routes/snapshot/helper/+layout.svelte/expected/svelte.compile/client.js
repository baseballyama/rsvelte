import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { snapshot } from '$app/navigation';

var root = $.from_html(`<label>layout <input data-testid="layout"/></label> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state('');

	snapshot({
		id: 'snapshot-helper-layout',
		capture: () => $.get(value),
		restore: (snapshot) => $.set(value, snapshot, true),
		reset: () => $.set(value, '')
	});

	var fragment = root();
	var label = $.first_child(fragment);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);

	var node = $.sibling(label, 2);

	$.snippet(node, () => $$props.children);
	$.bind_value(input, () => $.get(value), ($$value) => $.set(value, $$value));
	$.append($$anchor, fragment);
	$.pop();
}