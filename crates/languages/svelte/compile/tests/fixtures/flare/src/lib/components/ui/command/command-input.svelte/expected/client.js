import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command as CommandPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class', 'value']);
var root = $.from_html(`<div class="flex h-[46px] items-center gap-2 border-b px-3" data-slot="command-input-wrapper"><!></div>`);

export default function Command_input($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15, ''),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => cn('placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50', $$props.class));

		$.component(node, () => CommandPrimitive.Input, ($$anchor, CommandPrimitive_Input) => {
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