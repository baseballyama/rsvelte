import * as $ from 'svelte/internal/server';
import { getters } from "$lib/utils/getters.svelte.js";
import { Accordion as Builder } from "../builders/Accordion.svelte";

export default function Accordion($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, children, $$slots, $$events, ...rest } = $$props;

		const accordion = new Builder({
			value: () => value,
			onValueChange(v) {
				value = v;
			},
			...getters({ ...rest })
		});

		children($$renderer, accordion);
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { value, accordion });
	});
}