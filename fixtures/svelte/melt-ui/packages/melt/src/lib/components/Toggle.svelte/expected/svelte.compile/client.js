import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toggle as Builder } from "../builders/Toggle.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'children']);

export default function Toggle($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, false),
		rest = $.rest_props($$props, rest_excludes);

	const toggle = new Builder({
		value: () => value(),
		onValueChange: (v) => value(v),
		disabled: () => $$props.disabled
	});

	var $$exports = { toggle };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children, () => toggle);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}