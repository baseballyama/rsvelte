import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs as TabsPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import { useUnderlineTabs } from './underline-tabs.svelte.js';
import { box } from 'svelte-toolbelt';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'value',
	'id',
	'class'
]);

export default function Underline_tabs($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15, ''),
		id = $.prop($$props, 'id', 3, uid),
		restProps = $.rest_props($$props, rest_excludes);

	useUnderlineTabs({
		value: box.with(() => value(), (v) => value(v)),
		id: box.with(() => id())
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('flex flex-col gap-2', $$props.class));

		$.component(node, () => TabsPrimitive.Root, ($$anchor, TabsPrimitive_Root) => {
			TabsPrimitive_Root($$anchor, $.spread_props(
				{
					orientation: 'horizontal',
					'data-slot': 'underline-tabs',
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