import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PinInput as InputOTPPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class', 'value']);

export default function Input_otp($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("flex items-center gap-2 has-disabled:opacity-50 [&_input]:disabled:cursor-not-allowed", $$props.class));

		$.component(node, () => InputOTPPrimitive.Root, ($$anchor, InputOTPPrimitive_Root) => {
			InputOTPPrimitive_Root($$anchor, $.spread_props(
				{
					'data-slot': 'input-otp',
					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},

					get value() {
						return value();
					},

					set value($$value) {
						value($$value);
					}
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}