import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import FloatingLayer from "$lib/bits/utilities/floating-layer/components/floating-layer.svelte";
import { noop } from "$lib/internal/noop.js";
import { MenuMenuState, MenuRootState } from "$lib/bits/menu/menu.svelte.js";

export default function Context_menu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			open = false,
			dir = "ltr",
			// debugMode = false,
			onOpenChange = noop,
			onOpenChangeComplete = noop,
			children
		} = $$props;

		const root = MenuRootState.create({
			variant: boxWith(() => "context-menu"),
			dir: boxWith(() => dir),
			// debugMode: boxWith(() => debugMode),
			onClose: () => {
				open = false;
				onOpenChange?.(false);
			}
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