import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog as SheetPrimitive } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);

export default function Sheet_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => SheetPrimitive.Trigger, ($$anchor, SheetPrimitive_Trigger) => {
		SheetPrimitive_Trigger($$anchor, $.spread_props({ 'data-slot': 'sheet-trigger' }, () => restProps, {
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