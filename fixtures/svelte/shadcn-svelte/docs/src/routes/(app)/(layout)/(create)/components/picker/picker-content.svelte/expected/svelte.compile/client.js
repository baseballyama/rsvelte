import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'sideOffset',
	'portalProps',
	'class',
	'submenu'
]);

export default function Picker_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		sideOffset = $.prop($$props, 'sideOffset', 3, 20),
		submenu = $.prop($$props, 'submenu', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => cn("z-50 w-auto min-w-[96px] rounded-md bg-popover/90 p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 backdrop-blur-xs", $$props.class));

				$.component(node_1, () => DropdownMenuPrimitive.SubContent, ($$anchor, DropdownMenuPrimitive_SubContent) => {
					DropdownMenuPrimitive_SubContent($$anchor, $.spread_props(
						{
							'data-slot': 'dropdown-menu-sub-content',
							get sideOffset() {
								return sideOffset();
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
							}
						}
					));
				});
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.component(node_2, () => DropdownMenuPrimitive.Portal, ($$anchor, DropdownMenuPrimitive_Portal) => {
				DropdownMenuPrimitive_Portal($$anchor, $.spread_props(() => $$props.portalProps, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						{
							let $0 = $.derived(() => cn("cn-menu-target z-50 no-scrollbar max-h-(--available-height) w-[calc(var(--available-width)-(--spacing(6)))] min-w-32 origin-(--transform-origin) translate-y-2 overflow-x-hidden overflow-y-auto rounded-xl border-0 bg-neutral-950 p-1.5 text-neutral-100 ring-1 ring-neutral-950/80 outline-none data-[state=closed]:overflow-hidden md:w-52 dark:bg-neutral-800 dark:ring-neutral-700/50 [&.cn-menu-translucent]:bg-neutral-950/80 [&.cn-menu-translucent]:backdrop-blur-xl dark:[&.cn-menu-translucent]:bg-neutral-800/90", $$props.class));

							$.component(node_3, () => DropdownMenuPrimitive.Content, ($$anchor, DropdownMenuPrimitive_Content) => {
								DropdownMenuPrimitive_Content($$anchor, $.spread_props(
									{
										'data-slot': 'dropdown-menu-content',
										get sideOffset() {
											return sideOffset();
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
										}
									}
								));
							});
						}

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				}));
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if (submenu()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}