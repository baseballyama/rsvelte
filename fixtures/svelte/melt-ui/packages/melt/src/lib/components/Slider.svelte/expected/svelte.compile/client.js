import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getters } from "$lib/utils/getters.svelte.js";
import { Slider as Builder } from "../builders/Slider.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'children']);

export default function Slider($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		rest = $.rest_props($$props, rest_excludes);

	const slider = new Builder({
		value: () => value(),
		onValueChange: (v) => value(v),
		...getters(rest)
	});

	var $$exports = { slider };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children, () => slider);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}