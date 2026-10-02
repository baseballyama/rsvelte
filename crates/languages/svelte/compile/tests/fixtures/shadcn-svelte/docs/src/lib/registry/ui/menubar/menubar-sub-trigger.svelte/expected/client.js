import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Menubar as MenubarPrimitive } from "bits-ui";
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

export default function Menubar_sub_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		inset = $.prop($$props, 'inset', 3, undefined),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("cn-menubar-sub-trigger flex cursor-default items-center outline-none select-none", $$props.class));

		$.component(node, () => MenubarPrimitive.SubTrigger, ($$anchor, MenubarPrimitive_SubTrigger) => {
			MenubarPrimitive_SubTrigger($$anchor, $.spread_props(
				{
					'data-slot': 'menubar-sub-trigger',
					get 'data-inset'() {
						return inset();
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
							class: 'cn-rtl-flip ml-auto size-4'
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