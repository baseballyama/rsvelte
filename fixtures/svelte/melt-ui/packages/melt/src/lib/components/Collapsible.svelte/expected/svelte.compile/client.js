import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getters } from "$lib/utils/getters.svelte.js";
import { Collapsible as Builder } from "../builders/Collapsible.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'open', 'children']);

export default function Collapsible($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		rest = $.rest_props($$props, rest_excludes);

	const collapsible = new Builder({
		open: () => open(),
		onOpenChange: (v) => open(v),
		...getters(rest)
	});

	var $$exports = { collapsible };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children, () => collapsible);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}