import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getters } from "../utils/getters.svelte";
import { Popover as Builder } from "../builders/Popover.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'open', 'children']);

export default function Popover($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		rest = $.rest_props($$props, rest_excludes);

	const popover = new Builder({
		open: () => open(),
		onOpenChange: (v) => open(v),
		...getters(rest),
		focus: { ...getters(rest).focus }
	});

	var $$exports = { popover };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children, () => popover);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}