import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { TextSelectionLayerState } from "./use-text-selection-layer.svelte.js";
import { noop } from "$lib/internal/noop.js";

export default function Text_selection_layer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			preventOverflowTextSelection = true,
			onPointerDown = noop,
			onPointerUp = noop,
			id,
			children,
			enabled,
			ref
		} = $$props;

		TextSelectionLayerState.create({
			id: boxWith(() => id),
			onPointerDown: boxWith(() => onPointerDown),
			onPointerUp: boxWith(() => onPointerUp),
			enabled: boxWith(() => enabled && preventOverflowTextSelection),
			ref
		});

		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}