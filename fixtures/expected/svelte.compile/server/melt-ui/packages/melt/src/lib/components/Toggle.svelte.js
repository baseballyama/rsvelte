import * as $ from 'svelte/internal/server';
import { Toggle as Builder } from "../builders/Toggle.svelte";

export default function Toggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = false, children, $$slots, $$events, ...rest } = $$props;

		const toggle = new Builder({
			value: () => value,
			onValueChange: (v) => value = v,
			disabled: () => rest.disabled
		});

		children($$renderer, toggle);
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { value, toggle });
	});
}