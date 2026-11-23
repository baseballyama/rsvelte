import * as $ from "svelte/internal/server";
import { createEventDispatcher } from "svelte";
export default function Withevents($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { a } = $$props;
		const d = createEventDispatcher();
	});
}
