import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meter as MeterPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'max',
	'value'
]);

var root = $.from_html(`<div class="h-full w-full flex-1 bg-(--meter-background) transition-[color,transform]"></div>`);

export default function Meter($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		max = $.prop($$props, 'max', 3, 100),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('relative h-2 w-full overflow-hidden rounded-full bg-(--meter-background)/20 [--meter-background:var(--primary)]', $$props.class));

		$.component(node, () => MeterPrimitive.Root, ($$anchor, MeterPrimitive_Root) => {
			MeterPrimitive_Root($$anchor, $.spread_props(
				{
					get max() {
						return max();
					},

					get value() {
						return $$props.value;
					},

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

					children: ($$anchor, $$slotProps) => {
						var div = root();

						$.template_effect(() => $.set_style(div, `transform: translateX(-${100 - 100 * ($$props.value ?? 0) / (max() ?? 1)}%)`));
						$.append($$anchor, div);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}