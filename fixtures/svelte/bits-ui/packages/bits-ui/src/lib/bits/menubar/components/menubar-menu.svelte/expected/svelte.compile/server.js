import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { MenubarMenuState } from "../menubar.svelte.js";
import Menu from "$lib/bits/menu/components/menu.svelte";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";

export default function Menubar_menu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			value = createId(uid),
			onOpenChange = noop,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const menuState = MenubarMenuState.create({
			value: boxWith(() => value),
			onOpenChange: boxWith(() => onOpenChange)
		});

		Menu($$renderer, $.spread_props([
			{
				open: menuState.open,
				onOpenChange: (open) => {
					if (!open) menuState.root.onMenuClose();
				},
				dir: menuState.root.opts.dir.current,
				_internal_variant: 'menubar'
			},
			restProps,
			{
				_internal_should_skip_exit_animation: () => menuState.root.skipExitAnimationForMenuValue === menuState.opts.value.current
			}
		]));
	});
}