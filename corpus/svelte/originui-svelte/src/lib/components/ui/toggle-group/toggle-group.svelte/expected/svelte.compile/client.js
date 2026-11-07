import 'svelte/internal/disclose-version';
import { getContext, setContext } from 'svelte';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui';

export function setToggleGroupCtx(props) {
	setContext('toggleGroup', props);
}

export function getToggleGroupCtx() {
	return getContext('toggleGroup');
}

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'ref',
	'size',
	'value',
	'variant'
]);

export default function Toggle_group($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		size = $.prop($$props, 'size', 3, 'default'),
		value = $.prop($$props, 'value', 15),
		variant = $.prop($$props, 'variant', 3, 'default'),
		restProps = $.rest_props($$props, rest_excludes);

	setToggleGroupCtx({ size: size(), variant: variant() });

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('group/toggle-group flex items-center rounded-md data-[variant=outline]:shadow-2xs', $$props.class));

		$.component(node, () => ToggleGroupPrimitive.Root, ($$anchor, ToggleGroupPrimitive_Root) => {
			ToggleGroupPrimitive_Root($$anchor, $.spread_props(
				{
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
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}