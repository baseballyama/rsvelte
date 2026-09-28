import 'svelte/internal/disclose-version';
import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

export const RadioGroupItem = RadioGroupPrimitive.Item;

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'ref',
	'value'
]);

export default function Radio_group($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15, undefined),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('grid gap-3', $$props.class));

		$.component(node, () => RadioGroupPrimitive.Root, ($$anchor, RadioGroupPrimitive_Root) => {
			RadioGroupPrimitive_Root($$anchor, $.spread_props(
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
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_1 = $.first_child(fragment_1);

						$.snippet(node_1, () => $$props.children ?? $.noop);
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}