import * as $ from 'svelte/internal/server';
import { getters } from "$lib/utils/getters.svelte.js";
import { Slider as Builder } from "../builders/Slider.svelte";

export default function Slider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, children, $$slots, $$events, ...rest } = $$props;

		const slider = new Builder({
			value: () => value,
			onValueChange: (v) => value = v,
			...getters(rest)
		});

		children($$renderer, slider);
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { value, slider });
	});
}