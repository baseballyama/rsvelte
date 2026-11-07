import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command as CommandPrimitive } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);

export default function Command_loading($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => CommandPrimitive.Loading, ($$anchor, CommandPrimitive_Loading) => {
		CommandPrimitive_Loading($$anchor, $.spread_props(() => restProps, {
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			}
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}