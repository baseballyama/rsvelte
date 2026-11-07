import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import Search from '@lucide/svelte/icons/search';
import { Command as CommandPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'ref', 'value']);
var root = $.from_html(`<div class="border-input flex items-center border-b px-5" data-command-input-wrapper=""><!> <!></div>`);

export default function Command_input($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15, ''),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();
	var node = $.child(div);

	Search(node, { size: 20, class: 'text-muted-foreground/80 me-3' });

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => cn('placeholder:text-muted-foreground/70 flex h-10 w-full rounded-lg bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50', $$props.class));

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