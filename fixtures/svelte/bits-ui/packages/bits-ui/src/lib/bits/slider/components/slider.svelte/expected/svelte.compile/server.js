import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { SliderRootState } from "../slider.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";
import { watch } from "runed";

export default function Slider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			children,
			child,
			id = createId(uid),
			ref = null,
			value = void 0,
			type,
			onValueChange = noop,
			onValueCommit = noop,
			disabled = false,
			min: minProp,
			max: maxProp,
			step = 1,
			dir = "ltr",
			autoSort = true,
			orientation = "horizontal",
			thumbPositioning = "contain",
			trackPadding,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const min = $.derived(() => {
			if (minProp !== undefined) return minProp;
			if (Array.isArray(step)) return Math.min(...step);

			return 0;
		});

		const max = $.derived(() => {
			if (maxProp !== undefined) return maxProp;
			if (Array.isArray(step)) return Math.max(...step);

			return 100;
		});

		function handleDefaultValue() {
			if (value !== undefined) return;

			if (type === "single") {
				return min();
			}

			return [];
		}

		// SSR
		handleDefaultValue();

		watch.pre(() => value, () => {
			handleDefaultValue();
		});

		const rootState = SliderRootState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			value: boxWith(() => value, (v) => {
				value = v;

				// @ts-expect-error - we know
				onValueChange(v);
			}),

			// @ts-expect-error - we know
			onValueCommit: boxWith(() => onValueCommit),
			disabled: boxWith(() => disabled),
			min: boxWith(() => min()),
			max: boxWith(() => max()),
			step: boxWith(() => step),
			dir: boxWith(() => dir),
			autoSort: boxWith(() => autoSort),
			orientation: boxWith(() => orientation),
			thumbPositioning: boxWith(() => thumbPositioning),
			type,
			trackPadding: boxWith(() => trackPadding)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, rootState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps(), ...rootState.snippetProps });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><span${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer, rootState.snippetProps);
			$$renderer.push(`<!----></span>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref, value });
	});
}