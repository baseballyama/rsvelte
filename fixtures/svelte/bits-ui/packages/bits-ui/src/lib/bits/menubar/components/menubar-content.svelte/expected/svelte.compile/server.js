import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { MenubarContentState } from "../menubar.svelte.js";
import MenuContent from "$lib/bits/menu/components/menu-content.svelte";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

export default function Menubar_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			ref = null,
			interactOutsideBehavior = "close",
			id = createId(uid),
			onInteractOutside = noop,
			onFocusOutside = noop,
			onCloseAutoFocus = noop,
			onOpenAutoFocus = noop,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const contentState = MenubarContentState.create({
			id: boxWith(() => id),
			interactOutsideBehavior: boxWith(() => interactOutsideBehavior),
			ref: boxWith(() => ref, (v) => ref = v),
			onInteractOutside: boxWith(() => onInteractOutside),
			onFocusOutside: boxWith(() => onFocusOutside),
			onCloseAutoFocus: boxWith(() => onCloseAutoFocus),
			onOpenAutoFocus: boxWith(() => onOpenAutoFocus)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, contentState.props));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MenuContent($$renderer, $.spread_props([
				mergedProps(),
				contentState.popperProps,
				{
					preventScroll: false,
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					}
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}