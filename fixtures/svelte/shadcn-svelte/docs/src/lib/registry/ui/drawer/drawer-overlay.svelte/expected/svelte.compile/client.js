import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Drawer as DrawerPrimitive } from "vaul-svelte";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Drawer_overlay($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("cn-drawer-overlay fixed inset-0 z-50", $$props.class));

		$.component(node, () => DrawerPrimitive.Overlay, ($$anchor, DrawerPrimitive_Overlay) => {
			DrawerPrimitive_Overlay($$anchor, $.spread_props(
				{
					'data-slot': 'drawer-overlay',
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
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}