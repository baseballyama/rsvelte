import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SearchIcon from '@lucide/svelte/icons/search';
import { Command as CommandPrimitive } from 'bits-ui';
import { useEmojiPickerInput } from './emoji-picker.svelte.js';
import { box } from 'svelte-toolbelt';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'placeholder']);
var root = $.from_html(`<div class="p-2"><div class="bg-input border-input dark:bg-input/30 flex h-9 items-center gap-2 rounded-md border px-3"><!> <!></div></div>`);

export default function Emoji_picker_search($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, ''),
		placeholder = $.prop($$props, 'placeholder', 3, 'Search'),
		rest = $.rest_props($$props, rest_excludes);

	useEmojiPickerInput({ value: box.with(() => value(), (v) => value(v)) });

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	SearchIcon(node, { class: 'size-4 shrink-0 opacity-50' });

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => CommandPrimitive.Input, ($$anchor, CommandPrimitive_Input) => {
		CommandPrimitive_Input($$anchor, $.spread_props(() => rest, {
			get placeholder() {
				return placeholder();
			},
			class: 'placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
			get value() {
				return value();
			},

			set value($$value) {
				value($$value);
			}
		}));
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}