import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { DialogRootState } from "../dialog.svelte.js";
import { noop } from "$lib/internal/noop.js";

export default function Dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			open = false,
			onOpenChange = noop,
			onOpenChangeComplete = noop,
			children
		} = $$props;

		DialogRootState.create({
			variant: boxWith(() => "dialog"),
			open: boxWith(() => open, (v) => {
				open = v;
				onOpenChange(v);
			}),
			onOpenChangeComplete: boxWith(() => onOpenChangeComplete)
		});

		children?.($$renderer);
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { open });
	});
}