import * as $ from "svelte/internal/server";
import { createEventDispatcher } from "svelte";
export default function Dispatched_events($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const d = createEventDispatcher();
		let { a } = $$props;
		d("go", 1);
		$$renderer.push(`<p>${$.escape(a)}</p>`);
	});
}
