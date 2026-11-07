import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getters } from "$lib/utils/getters.svelte.js";
import { Progress as Builder } from "../builders/Progress.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'children']);

export default function Progress($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		rest = $.rest_props($$props, rest_excludes);

	const progress = new Builder({
		value: () => value(),
		onValueChange: (v) => value(v),
		...getters(rest)
	});

	var $$exports = { progress };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children, () => progress);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}