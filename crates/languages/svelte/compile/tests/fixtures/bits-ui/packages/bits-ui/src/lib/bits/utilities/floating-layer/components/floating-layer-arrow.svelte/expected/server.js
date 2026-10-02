import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { FloatingArrowState } from "../use-floating-layer.svelte.js";
import { Arrow } from "$lib/bits/utilities/arrow/index.js";
import { useId } from "$lib/internal/use-id.js";

export default function Floating_layer_arrow($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { id = useId(), ref = null, $$slots, $$events, ...restProps } = $$props;

		const arrowState = FloatingArrowState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, arrowState.props));

		Arrow($$renderer, $.spread_props([mergedProps()]));
		$.bind_props($$props, { ref });
	});
}