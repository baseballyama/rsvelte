import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { NavigationMenuRootState } from "../navigation-menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

export default function Navigation_menu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			child,
			children,
			id = createId(uid),
			ref = null,
			value = "",
			onValueChange = noop,
			delayDuration = 200,
			skipDelayDuration = 300,
			dir = "ltr",
			orientation = "horizontal",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const rootState = NavigationMenuRootState.create({
			id: boxWith(() => id),
			value: boxWith(() => value, (v) => {
				value = v;
				onValueChange(v);
			}),
			delayDuration: boxWith(() => delayDuration),
			skipDelayDuration: boxWith(() => skipDelayDuration),
			dir: boxWith(() => dir),
			orientation: boxWith(() => orientation),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps({ "aria-label": "main" }, restProps, rootState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><nav${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></nav>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref, value });
	});
}