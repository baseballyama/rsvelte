import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { Textarea } from '$lib/components/ui/textarea/index.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'value', 'class']);

export default function Input_group_textarea($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		props = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => cn('flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent', $$props.class));

		Textarea($$anchor, $.spread_props(
			{
				'data-slot': 'input-group-control',
				get class() {
					return $.get($0);
				}
			},
			() => props,
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