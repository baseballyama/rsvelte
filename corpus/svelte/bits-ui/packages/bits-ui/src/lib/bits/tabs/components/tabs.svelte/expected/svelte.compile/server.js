import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { TabsRootState } from "../tabs.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

export default function Tabs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			value = "",
			onValueChange = noop,
			orientation = "horizontal",
			loop = true,
			activationMode = "automatic",
			disabled = false,
			children,
			child,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const rootState = TabsRootState.create({
			id: boxWith(() => id),
			value: boxWith(() => value, (v) => {
				value = v;
				onValueChange(v);
			}),
			orientation: boxWith(() => orientation),
			loop: boxWith(() => loop),
			activationMode: boxWith(() => activationMode),
			disabled: boxWith(() => disabled),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, rootState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref, value });
	});
}