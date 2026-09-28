import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command as CommandPrimitive } from "bits-ui";
import Search from "@lucide/svelte/icons/search";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class', 'value']);
var root = $.from_html(`<div class="flex items-center border-b px-3" data-command-input-wrapper=""><!> <!></div>`);

export default function Command_input($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();
	var node = $.child(div);

	Search(node, { class: 'mr-2 size-4 shrink-0 opacity-50' });

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => cn("flex h-10 w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", $$props.class));

		$.component(node_1, () => CommandPrimitive.Input, ($$anchor, CommandPrimitive_Input) => {
			CommandPrimitive_Input($$anchor, $.spread_props(
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

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}