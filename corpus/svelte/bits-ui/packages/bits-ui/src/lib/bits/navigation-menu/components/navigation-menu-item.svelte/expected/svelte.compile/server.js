import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { NavigationMenuItemState } from "../navigation-menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Navigation_menu_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);
		const defaultId = createId(uid);

		let {
			id = defaultId,
			value = defaultId,
			ref = null,
			child,
			children,
			openOnHover = true,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const itemState = NavigationMenuItemState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			value: boxWith(() => value),
			openOnHover: boxWith(() => openOnHover)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, itemState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><li${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></li>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}