import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from "$lib/registry/ui/input/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'value', 'class']);

export default function Input_group_input($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		props = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => cn("cn-input-group-input flex-1", $$props.class));

		Input($$anchor, $.spread_props(
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