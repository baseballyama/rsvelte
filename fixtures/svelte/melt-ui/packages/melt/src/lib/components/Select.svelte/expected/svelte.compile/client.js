import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getters } from "../utils/getters.svelte";
import { Select as Builder } from "../builders/Select.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'children',
	'highlighted'
]);

export default function Select($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		highlighted = $.prop($$props, 'highlighted', 15),
		rest = $.rest_props($$props, rest_excludes);

	const select = new Builder({
		value: () => value(),
		onValueChange(v) {
			value(v);
		},
		highlighted: () => highlighted(),
		onHighlightChange(v) {
			highlighted(v);
		},
		...getters({ ...rest }),
		focus: { ...getters(rest).focus },
		// onNavigate should not be wrapped in a getter since it's a callback function
		onNavigate: $$props.onNavigate
	});

	var $$exports = { select };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children, () => select);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}