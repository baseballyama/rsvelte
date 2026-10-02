import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tabs from '$lib/components/ui/tabs';
import { cn } from '$lib/utils';
import { Tabs as TabsPrimitive } from 'bits-ui';
import { useDemo } from './demo.svelte.js';
import { box } from 'svelte-toolbelt';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'ref',
	'class',
	'children'
]);

export default function Demo($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, 'preview'),
		ref = $.prop($$props, 'ref', 15, null),
		rest = $.rest_props($$props, rest_excludes);

	useDemo({ value: box.with(() => value(), (v) => value(v)) });

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn($$props.class));

		$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
			Tabs_Root($$anchor, $.spread_props(
				{
					'data-slot': 'demo',
					get class() {
						return $.get($0);
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