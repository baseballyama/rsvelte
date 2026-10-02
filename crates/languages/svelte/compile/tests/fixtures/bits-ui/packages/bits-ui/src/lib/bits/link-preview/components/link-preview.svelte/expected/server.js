import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { LinkPreviewRootState } from "../link-preview.svelte.js";
import { noop } from "$lib/internal/noop.js";
import { FloatingLayer } from "$lib/bits/utilities/floating-layer/index.js";

export default function Link_preview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			disabled = false,
			open = false,
			onOpenChange = noop,
			onOpenChangeComplete = noop,
			openDelay = 700,
			closeDelay = 300,
			children
		} = $$props;

		LinkPreviewRootState.create({
			disabled: boxWith(() => disabled),
			open: boxWith(() => open, (v) => {
				open = v;
				onOpenChange(v);
			}),
			openDelay: boxWith(() => openDelay),
			closeDelay: boxWith(() => closeDelay),
			onOpenChangeComplete: boxWith(() => onOpenChangeComplete)
		});

		if (FloatingLayer.Root) {
			$$renderer.push('<!--[-->');

			FloatingLayer.Root($$renderer, {
				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$.bind_props($$props, { open });
	});
}