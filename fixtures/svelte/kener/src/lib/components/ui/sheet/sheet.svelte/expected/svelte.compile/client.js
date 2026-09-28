import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog as SheetPrimitive } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'open']);

export default function Sheet($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => SheetPrimitive.Root, ($$anchor, SheetPrimitive_Root) => {
		SheetPrimitive_Root($$anchor, $.spread_props(() => restProps, {
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