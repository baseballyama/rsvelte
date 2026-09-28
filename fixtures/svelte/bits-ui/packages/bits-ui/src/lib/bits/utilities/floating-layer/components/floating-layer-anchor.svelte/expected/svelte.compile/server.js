import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { FloatingAnchorState } from "../use-floating-layer.svelte.js";

export default function Floating_layer_anchor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { id, children, virtualEl, ref, tooltip = false } = $$props;

		FloatingAnchorState.create(
			{
				id: boxWith(() => id),
				virtualEl: boxWith(() => virtualEl),
				ref
			},
			tooltip
		);

		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}