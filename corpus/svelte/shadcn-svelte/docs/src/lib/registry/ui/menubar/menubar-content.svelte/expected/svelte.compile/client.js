import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Menubar as MenubarPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import MenubarPortal from "./menubar-portal.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'sideOffset',
	'alignOffset',
	'align',
	'side',
	'portalProps'
]);

export default function Menubar_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		sideOffset = $.prop($$props, 'sideOffset', 3, 8),
		alignOffset = $.prop($$props, 'alignOffset', 19, () => -4),
		align = $.prop($$props, 'align', 3, "start"),
		side = $.prop($$props, 'side', 3, "bottom"),
		restProps = $.rest_props($$props, rest_excludes);

	MenubarPortal($$anchor, $.spread_props(() => $$props.portalProps, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => cn("cn-menu-target cn-menu-translucent z-50 min-w-36 origin-(--bits-menubar-content-transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95", $$props.class));

				$.component(node, () => MenubarPrimitive.Content, ($$anchor, MenubarPrimitive_Content) => {
					MenubarPrimitive_Content($$anchor, $.spread_props(
						{
							'data-slot': 'menubar-content',
							get align() {
								return align();
							},

							get alignOffset() {
								return alignOffset();
							},

							get side() {
								return side();
							},

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
		},
		$$slots: { default: true }
	}));

	$.pop();
}