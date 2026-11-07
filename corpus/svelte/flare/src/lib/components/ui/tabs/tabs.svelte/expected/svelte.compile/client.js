import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs as TabsPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'value', 'class']);

export default function Tabs($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15, ''),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('flex flex-col gap-2', $$props.class));

		$.component(node, () => TabsPrimitive.Root, ($$anchor, TabsPrimitive_Root) => {
			TabsPrimitive_Root($$anchor, $.spread_props(
				{
					'data-slot': 'tabs',
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