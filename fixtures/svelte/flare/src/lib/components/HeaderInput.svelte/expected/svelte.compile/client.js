import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from '$lib/components/ui/input';
import { cn } from '$lib/utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'ref', 'class']);

export default function HeaderInput($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		ref = $.prop($$props, 'ref', 15, null),
		rest = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => cn('h-15 w-full rounded-none border-none !bg-transparent px-4 pr-0 !text-lg shadow-none focus-visible:ring-0 focus-visible:ring-offset-0', $$props.class));

		Input($$anchor, $.spread_props(
			{
				type: 'text',
				get class() {
					return $.get($0);
				}
			},
			() => rest,
			{
				onkeydown: (e) => {
					if (e.key === 'Escape' && value()) {
						e.preventDefault();
						value('');
					}

					$$props.onkeydown?.(e);
				},

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