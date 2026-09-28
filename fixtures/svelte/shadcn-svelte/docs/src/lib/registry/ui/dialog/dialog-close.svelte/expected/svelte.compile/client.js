import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog as DialogPrimitive } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'type']);

export default function Dialog_close($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		type = $.prop($$props, 'type', 3, "button"),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DialogPrimitive.Close, ($$anchor, DialogPrimitive_Close) => {
		DialogPrimitive_Close($$anchor, $.spread_props(
			{
				'data-slot': 'dialog-close',
				get type() {
					return type();
				}
			},
			() => restProps,
			{
				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				}
			}
		));
	});

	$.append($$anchor, fragment);
	$.pop();
}