import * as $ from 'svelte/internal/server';
import { getters } from "$lib/utils/getters.svelte.js";
import { Progress as Builder } from "../builders/Progress.svelte";

export default function Progress($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, children, $$slots, $$events, ...rest } = $$props;

		const progress = new Builder({
			value: () => value,
			onValueChange: (v) => value = v,
			...getters(rest)
		});

		children($$renderer, progress);
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { value, progress });
	});
}