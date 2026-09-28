import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover as PopoverPrimitive } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'open']);

export default function Popover($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => PopoverPrimitive.Root, ($$anchor, PopoverPrimitive_Root) => {
		PopoverPrimitive_Root($$anchor, $.spread_props(() => restProps, {
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			}
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}