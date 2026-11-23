import * as $ from "svelte/internal/server";
import { createEventDispatcher } from "svelte";
export default function Let($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { a } = $$props;
		let GO = "go";
		const d = createEventDispatcher();
	});
}
