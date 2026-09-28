import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Context_menu_sub_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("cn-context-menu-sub-content cn-menu-target cn-menu-translucent", $$props.class));

		$.component(node, () => ContextMenuPrimitive.SubContent, ($$anchor, ContextMenuPrimitive_SubContent) => {
			ContextMenuPrimitive_SubContent($$anchor, $.spread_props(
				{
					'data-slot': 'context-menu-sub-content',
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