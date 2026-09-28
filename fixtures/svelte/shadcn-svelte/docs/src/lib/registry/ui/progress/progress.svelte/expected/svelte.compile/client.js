import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progress as ProgressPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'max',
	'value'
]);

var root = $.from_html(`<div data-slot="progress-indicator" class="cn-progress-indicator size-full flex-1 transition-all"></div>`);

export default function Progress($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		max = $.prop($$props, 'max', 3, 100),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("cn-progress relative flex w-full items-center overflow-x-hidden", $$props.class));

		$.component(node, () => ProgressPrimitive.Root, ($$anchor, ProgressPrimitive_Root) => {
			ProgressPrimitive_Root($$anchor, $.spread_props(
				{
					'data-slot': 'progress',
					get class() {
						return $.get($0);
					},

					get value() {
						return $$props.value;
					},

					get max() {
						return max();
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