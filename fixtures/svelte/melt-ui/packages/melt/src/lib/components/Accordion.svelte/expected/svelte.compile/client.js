import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getters } from "$lib/utils/getters.svelte.js";
import { Accordion as Builder } from "../builders/Accordion.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'children']);

export default function Accordion($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		rest = $.rest_props($$props, rest_excludes);

	const accordion = new Builder({
		value: () => value(),
		onValueChange(v) {
			value(v);
		},
		...getters({ ...rest })
	});

	var $$exports = { accordion };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children, () => accordion);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}