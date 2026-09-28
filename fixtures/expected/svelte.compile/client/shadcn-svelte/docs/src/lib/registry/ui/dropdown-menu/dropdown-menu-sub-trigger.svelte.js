import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'inset',
	'children'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Dropdown_menu_sub_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("cn-dropdown-menu-sub-trigger flex cursor-default items-center outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0", $$props.class));

		$.component(node, () => DropdownMenuPrimitive.SubTrigger, ($$anchor, DropdownMenuPrimitive_SubTrigger) => {
			DropdownMenuPrimitive_SubTrigger($$anchor, $.spread_props(
				{
					'data-slot': 'dropdown-menu-sub-trigger',
					get 'data-inset'() {
						return $$props.inset;
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
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						$.snippet(node_1, () => $$props.children ?? $.noop);

						var node_2 = $.sibling(node_1, 2);

						IconPlaceholder(node_2, {
							lucide: 'ChevronRightIcon',
							tabler: 'IconChevronRight',
							hugeicons: 'ArrowRight01Icon',
							phosphor: 'CaretRightIcon',
							remixicon: 'RiArrowRightSLine',
							class: 'ml-auto'
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