import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ButtonGroup from '$lib/components/ui/button-group/button-group.svelte';
import { useSplitButtonRoot } from './split-button.svelte.js';
import { box } from 'svelte-toolbelt';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'orientation',
	'value',
	'disabled',
	'onclick',
	'onClickPromise',
	'onActionSelect',
	'children'
]);

export default function Split_button($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		orientation = $.prop($$props, 'orientation', 3, 'horizontal'),
		value = $.prop($$props, 'value', 15, undefined),
		rest = $.rest_props($$props, rest_excludes);

	useSplitButtonRoot({
		value: box.with(() => value(), (v) => value(v)),
		disabled: box.with(() => $$props.disabled),
		onclick: box.with(() => $$props.onclick),
		onClickPromise: box.with(() => $$props.onClickPromise),
		onActionSelect: box.with(() => $$props.onActionSelect)
	});

	ButtonGroup($$anchor, $.spread_props(
		{
			get class() {
				return $$props.class;
			},

			get orientation() {
				return orientation();
			}
		},
		() => rest,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}