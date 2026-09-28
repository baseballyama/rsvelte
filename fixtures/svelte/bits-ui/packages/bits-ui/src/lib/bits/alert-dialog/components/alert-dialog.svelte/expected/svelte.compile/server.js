import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { noop } from "$lib/internal/noop.js";
import { DialogRootState } from "$lib/bits/dialog/dialog.svelte.js";

export default function Alert_dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			open = false,
			onOpenChange = noop,
			onOpenChangeComplete = noop,
			children
		} = $$props;

		DialogRootState.create({
			variant: boxWith(() => "alert-dialog"),
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