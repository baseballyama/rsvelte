import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog as DialogPrimitive } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);

export default function Dialog_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DialogPrimitive.Trigger, ($$anchor, DialogPrimitive_Trigger) => {
		DialogPrimitive_Trigger($$anchor, $.spread_props({ 'data-slot': 'dialog-trigger' }, () => restProps, {
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