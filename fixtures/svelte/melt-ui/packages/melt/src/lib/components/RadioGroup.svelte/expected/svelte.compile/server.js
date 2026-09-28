import * as $ from 'svelte/internal/server';
import { getters } from "$lib/utils/getters.svelte.js";
import { RadioGroup as Builder } from "../builders/RadioGroup.svelte";

export default function RadioGroup($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = undefined, children, $$slots, $$events, ...rest } = $$props;

		const group = new Builder({
			value: () => value,
			onValueChange: (v) => value = v,
			...getters(rest)
		});

		children($$renderer, group);
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { value, group });
	});
}