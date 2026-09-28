import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command as CommandPrimitive } from "bits-ui";
import SearchIcon from "@lucide/svelte/icons/search";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class', 'value']);
var root = $.from_html(`<div class="flex h-9 items-center gap-2 border-b ps-3 pe-8" data-slot="command-input-wrapper"><!> <!></div>`);

export default function Command_input($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();
	var node = $.child(div);

	SearchIcon(node, { class: 'size-4 shrink-0 opacity-50' });

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => cn("placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50", $$props.class));

		$.component(node_1, () => CommandPrimitive.Input, ($$anchor, CommandPrimitive_Input) => {
			CommandPrimitive_Input($$anchor, $.spread_props(
				{
					'data-slot': 'command-input',
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

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}