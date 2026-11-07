import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command as CommandPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'ref', 'class']);

export default function Command($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, ""),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", $$props.class));

		$.component(node, () => CommandPrimitive.Root, ($$anchor, CommandPrimitive_Root) => {
			CommandPrimitive_Root($$anchor, $.spread_props(
				{
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