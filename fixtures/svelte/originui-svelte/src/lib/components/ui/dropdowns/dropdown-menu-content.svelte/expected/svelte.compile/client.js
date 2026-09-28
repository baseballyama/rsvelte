import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'onCloseAutoFocus',
	'onPointerDown',
	'onPointerDownOutside',
	'portalProps',
	'ref',
	'sideOffset'
]);

export default function Dropdown_menu_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		sideOffset = $.prop($$props, 'sideOffset', 3, 4),
		restProps = $.rest_props($$props, rest_excludes);

	let isCloseFromMouse = $.state(false);

	function handlePointerDown(e) {
		$.set(isCloseFromMouse, true);
		$$props.onPointerDown?.(e);
	}

	function handlePointerDownOutside(e) {
		$.set(isCloseFromMouse, true);
		$$props.onPointerDownOutside?.(e);
	}

	function handleCloseAutoFocus(e) {
		if ($$props.onCloseAutoFocus) {
			return $$props.onCloseAutoFocus(e);
		}

		if (!$.get(isCloseFromMouse)) {
			return;
		}

		e.preventDefault();
		$.set(isCloseFromMouse, false);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenuPrimitive.Portal, ($$anchor, DropdownMenuPrimitive_Portal) => {
		DropdownMenuPrimitive_Portal($$anchor, $.spread_props(() => $$props.portalProps, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => cn('border-border bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-40 overflow-hidden rounded-lg border p-1 shadow-lg shadow-black/5 data-dropdown-menu-content:focus:outline-hidden', $$props.class));

					$.component(node_1, () => DropdownMenuPrimitive.Content, ($$anchor, DropdownMenuPrimitive_Content) => {
						DropdownMenuPrimitive_Content($$anchor, $.spread_props(
							{
								get sideOffset() {
									return sideOffset();
								},

								get class() {
									return $.get($0);
								},
								onpointerdown: handlePointerDown,
								onInteractOutside: handlePointerDownOutside,
								onCloseAutoFocus: handleCloseAutoFocus
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
	});

	$.append($$anchor, fragment);
	$.pop();
}