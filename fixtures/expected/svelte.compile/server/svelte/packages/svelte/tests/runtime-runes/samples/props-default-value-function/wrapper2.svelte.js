import * as $ from 'svelte/internal/server';
import Inner from "./inner.svelte";

export default function Wrapper2($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { getter = () => -1 } = $$props;

		Inner($$renderer, { getter });
		$.bind_props($$props, { getter });
	});
}