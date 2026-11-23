import * as $ from "svelte/internal/server";
import { createEventDispatcher } from "svelte";
export default function Num($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { a } = $$props;
		const GO = 1;
		const d = createEventDispatcher();
	});
}
