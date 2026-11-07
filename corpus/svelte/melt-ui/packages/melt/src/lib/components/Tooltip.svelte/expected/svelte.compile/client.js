import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip as Builder } from "$lib/builders";
import { getters } from "$lib/utils/getters.svelte.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'open', 'children']);

export default function Tooltip($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		rest = $.rest_props($$props, rest_excludes);

	const tooltip = new Builder({
		open: () => open(),
		onOpenChange: (v) => open(v),
		...getters(rest)
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children, () => tooltip);
	$.append($$anchor, fragment);
	$.pop();
}