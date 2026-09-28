import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Switch as SwitchPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'checked',
	'size'
]);

export default function Switch($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		checked = $.prop($$props, 'checked', 15, false),
		size = $.prop($$props, 'size', 3, "default"),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("cn-switch peer group/switch relative inline-flex items-center transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50", $$props.class));

		$.component(node, () => SwitchPrimitive.Root, ($$anchor, SwitchPrimitive_Root) => {
			SwitchPrimitive_Root($$anchor, $.spread_props(
				{
					'data-slot': 'switch',
					get 'data-size'() {
						return size();
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

					get checked() {
						return checked();
					},

					set checked($$value) {
						checked($$value);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => SwitchPrimitive.Thumb, ($$anchor, SwitchPrimitive_Thumb) => {
							SwitchPrimitive_Thumb($$anchor, {
								'data-slot': 'switch-thumb',
								class: 'cn-switch-thumb pointer-events-none block ring-0 transition-transform rtl:data-[state=checked]:translate-x-[calc(-100%)]'
							});
						});

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