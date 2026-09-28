import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command as CommandPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'api',
	'ref',
	'value',
	'class'
]);

export default function Command($$anchor, $$props) {
	$.push($$props, true);

	let api = $.prop($$props, 'api', 15, null),
		ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("cn-command flex size-full flex-col overflow-hidden", $$props.class));

		$.component(node, () => CommandPrimitive.Root, ($$anchor, CommandPrimitive_Root) => {
			$.bind_this(
				CommandPrimitive_Root($$anchor, $.spread_props(
					{
						'data-slot': 'command',
						get class() {
							return $.get($0);
						}
					},
					() => restProps,
					{
						get value() {
							return value();
						},

						set value($$value) {
							value($$value);
						},

						get ref() {
							return ref();
						},

						set ref($$value) {
							ref($$value);
						}
					}
				)),
				($$value) => api($$value),
				() => api()
			);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}