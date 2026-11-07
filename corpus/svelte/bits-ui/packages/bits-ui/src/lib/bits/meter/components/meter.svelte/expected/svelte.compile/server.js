import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { MeterRootState } from "../meter.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Meter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			child,
			children,
			value = 0,
			max = 100,
			min = 0,
			id = createId(uid),
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const rootState = MeterRootState.create({
			value: boxWith(() => value),
			max: boxWith(() => max),
			min: boxWith(() => min),
			id: boxWith(() => id),
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
		$.bind_props($$props, { ref });
	});
}