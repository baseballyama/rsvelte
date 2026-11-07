import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith } from "svelte-toolbelt";
import { MenubarMenuState } from "../menubar.svelte.js";
import Menu from "$lib/bits/menu/components/menu.svelte";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'onOpenChange']);

export default function Menubar_menu($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let value = $.prop($$props, 'value', 19, () => createId(uid)),
		onOpenChange = $.prop($$props, 'onOpenChange', 3, noop),
		restProps = $.rest_props($$props, rest_excludes);

	const menuState = MenubarMenuState.create({
		value: boxWith(() => value()),
		onOpenChange: boxWith(() => onOpenChange())
	});

	Menu($$anchor, $.spread_props(
		{
			get open() {
				return menuState.open;
			},

			onOpenChange: (open) => {
				if (!open) menuState.root.onMenuClose();
			},

			get dir() {
				return menuState.root.opts.dir.current;
			},
			_internal_variant: 'menubar'
		},
		() => restProps,
		{
			_internal_should_skip_exit_animation: () => menuState.root.skipExitAnimationForMenuValue === menuState.opts.value.current
		}
	));

	$.pop();
}