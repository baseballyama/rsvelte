import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { RatingGroupRootState } from "../rating-group.svelte.js";
import RatingGroupInput from "./rating-group-input.svelte";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

export default function Rating_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			disabled = false,
			children,
			child,
			value = 0,
			ref = null,
			orientation = "horizontal",
			name = undefined,
			required = false,
			min = 0,
			max = 5,
			allowHalf = false,
			readonly = false,
			id = createId(uid),
			onValueChange = noop,
			"aria-label": ariaLabel,
			"aria-valuetext": ariaValuetextProp,
			hoverPreview = true,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (value < min || value > max) {
			value = Math.max(min, Math.min(max, value));
		}

		const ariaValuetext = $.derived(() => {
			if (ariaValuetextProp) return ariaValuetextProp;

			return (value, max) => `${value} out of ${max}`;
		});

		const rootState = RatingGroupRootState.create({
			orientation: boxWith(() => orientation),
			disabled: boxWith(() => disabled),
			name: boxWith(() => name),
			required: boxWith(() => required),
			min: boxWith(() => min),
			max: boxWith(() => max),
			allowHalf: boxWith(() => allowHalf),
			readonly: boxWith(() => readonly),
			id: boxWith(() => id),
			value: boxWith(() => value, (v) => {
				if (v === value) return;

				value = v;
				onValueChange?.(v);
			}),
			ref: boxWith(() => ref, (v) => ref = v),
			ariaValuetext: boxWith(() => ariaValuetext()),
			hoverPreview: boxWith(() => hoverPreview)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, rootState.props, { "aria-label": ariaLabel }));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps(), ...rootState.snippetProps });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer, rootState.snippetProps);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--> `);
		RatingGroupInput($$renderer, {});
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { value, ref });
	});
}