import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from '$lib/components/ui/input/index.js';
import { cn } from '$lib/utils.ts';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'value', 'class']);

export default function Sidebar_input($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15, ''),
		restProps = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => cn('bg-background focus-visible:ring-sidebar-ring h-8 w-full shadow-none focus-visible:ring-2', $$props.class));

		Input($$anchor, $.spread_props(
			{
				'data-sidebar': 'input',
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
	}

	$.pop();
}