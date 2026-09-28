import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { box } from 'svelte-toolbelt';
import { useEmojiPicker } from './emoji-picker.svelte.js';
import { Command as CommandPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'skin',
	'onSelect',
	'showRecents',
	'recentsKey',
	'maxRecents',
	'onSkinChange',
	'class',
	'children'
]);

export default function Emoji_picker($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, ''),
		skin = $.prop($$props, 'skin', 15, 0),
		onSelect = $.prop($$props, 'onSelect', 3, () => {}),
		showRecents = $.prop($$props, 'showRecents', 3, false),
		recentsKey = $.prop($$props, 'recentsKey', 3, ''),
		maxRecents = $.prop($$props, 'maxRecents', 3, 12),
		onSkinChange = $.prop($$props, 'onSkinChange', 3, () => {}),
		rest = $.rest_props($$props, rest_excludes);

	const state = useEmojiPicker({
		value: box.with(() => value(), (v) => value(v)),
		skin: box.with(() => skin(), (v) => skin(v)),
		showRecents: box.with(() => showRecents()),
		recentsKey: box.with(() => recentsKey()),
		maxRecents: box.with(() => maxRecents()),
		onSelect: box.with(() => onSelect()),
		onSkinChange: box.with(() => onSkinChange())
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('max-w-[232px]', $$props.class));

		$.component(node, () => CommandPrimitive.Root, ($$anchor, CommandPrimitive_Root) => {
			CommandPrimitive_Root($$anchor, $.spread_props(() => rest, {
				columns: 6,
				shouldFilter: false,
				get class() {
					return $.get($0);
				},

				get onValueChange() {
					return state.onValueChange;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					$.snippet(node_1, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}