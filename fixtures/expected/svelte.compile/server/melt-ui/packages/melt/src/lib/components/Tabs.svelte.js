import * as $ from 'svelte/internal/server';
import { getters } from "$lib/utils/getters.svelte.js";
import { Tabs as Builder } from "../builders/Tabs.svelte";

export default function Tabs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, children, $$slots, $$events, ...rest } = $$props;

		const tabs = new Builder({
			value: () => value,
			onValueChange: (v) => value = v,
			...getters(rest)
		});

		children($$renderer, tabs);
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { value, tabs });
	});
}