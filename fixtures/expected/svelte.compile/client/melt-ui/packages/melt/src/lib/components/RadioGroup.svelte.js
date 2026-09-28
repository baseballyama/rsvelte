import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getters } from "$lib/utils/getters.svelte.js";
import { RadioGroup as Builder } from "../builders/RadioGroup.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'children']);

export default function RadioGroup($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, undefined),
		rest = $.rest_props($$props, rest_excludes);

	const group = new Builder({
		value: () => value(),
		onValueChange: (v) => value(v),
		...getters(rest)
	});

	var $$exports = { group };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children, () => group);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}