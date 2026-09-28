import * as $ from 'svelte/internal/server';
import { getters } from "$lib/utils/getters.svelte.js";
import { FileUpload } from "../builders/FileUpload.svelte";

export default function FileUpload_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			selected = void 0,
			children,
			validate,
			multiple,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const fileUpload = new FileUpload({
			...getters(rest),
			selected: () => selected,
			onSelectedChange(v) {
				selected = v;
			},
			multiple: () => multiple
		});

		children($$renderer, fileUpload);
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { selected });
	});
}