import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { NavigationMenuLinkState } from "../navigation-menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

export default function Navigation_menu_link($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			child,
			children,
			active = false,
			onSelect = noop,
			tabindex = 0,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const linkState = NavigationMenuLinkState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			active: boxWith(() => active),
			onSelect: boxWith(() => onSelect)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, linkState.props, { tabindex }));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><a${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></a>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}