import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { MenuMenuState, MenuRootState } from "../menu.svelte.js";
import { noop } from "$lib/internal/noop.js";
import FloatingLayer from "$lib/bits/utilities/floating-layer/components/floating-layer.svelte";

export default function Menu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			open = false,
			dir = "ltr",
			// debugMode = false,
			onOpenChange = noop,
			onOpenChangeComplete = noop,
			_internal_variant: variant = "dropdown-menu",
			_internal_should_skip_exit_animation: shouldSkipExitAnimation = undefined,
			children
		} = $$props;

		const root = MenuRootState.create({
			variant: boxWith(() => variant),
			dir: boxWith(() => dir),
			// debugMode: boxWith(() => debugMode),
			onClose: () => {
				open = false;
				onOpenChange(false);
			},
			shouldSkipExitAnimation: () => shouldSkipExitAnimation?.() ?? false
		});

		MenuMenuState.create(
			{
				open: boxWith(() => open, (v) => {
					open = v;
					onOpenChange(v);
				}),
				onOpenChangeComplete: boxWith(() => onOpenChangeComplete)
			},
			root
		);

		FloatingLayer($$renderer, {
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { open });
	});
}