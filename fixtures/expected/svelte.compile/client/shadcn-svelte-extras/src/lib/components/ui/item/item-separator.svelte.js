import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Separator } from '$lib/components/ui/separator/index.js';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Item_separator($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => cn('my-2', $$props.class));

		Separator($$anchor, $.spread_props(
			{
				'data-slot': 'item-separator',
				orientation: 'horizontal',
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
				}
			}
		));
	}

	$.pop();
}