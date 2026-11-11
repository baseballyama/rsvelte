import * as $ from "svelte/internal/server";
export default function Class_state_field($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			count = 0;
		}
		const counter = new Counter();
		$$renderer.push(`<button>${$.escape(counter.count)}</button>`);
	});
}
