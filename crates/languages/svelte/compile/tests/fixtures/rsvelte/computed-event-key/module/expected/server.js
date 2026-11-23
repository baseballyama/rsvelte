import * as $ from "svelte/internal/server";
import { createEventDispatcher } from "svelte";
const GO = "go";
export default function Module($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { a } = $$props;
		const d = createEventDispatcher();
	});
}
