import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { MenuSubmenuState } from "../menu.svelte.js";
import FloatingLayer from "$lib/bits/utilities/floating-layer/components/floating-layer.svelte";
import { noop } from "$lib/internal/noop.js";

export default function Menu_sub($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			open = false,
			onOpenChange = noop,
			onOpenChangeComplete = noop,
			children
		} = $$props;

		MenuSubmenuState.create({
			open: boxWith(() => open, (v) => {
				open = v;
				onOpenChange?.(v);
			}),
			onOpenChangeComplete: boxWith(() => onOpenChangeComplete)
		});

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