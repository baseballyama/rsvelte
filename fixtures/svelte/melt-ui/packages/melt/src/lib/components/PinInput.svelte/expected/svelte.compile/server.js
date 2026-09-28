import * as $ from 'svelte/internal/server';
import { getters } from "$lib/utils/getters.svelte.js";
import { PinInput as Builder } from "../builders/PinInput.svelte";

export default function PinInput($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, children, $$slots, $$events, ...rest } = $$props;

		const pinInput = new Builder({
			value: () => value,
			onValueChange: (v) => value = v,
			...getters(rest)
		});

		children($$renderer, pinInput);
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { value, pinInput });
	});
}