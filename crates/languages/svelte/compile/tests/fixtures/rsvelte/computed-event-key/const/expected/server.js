import * as $ from "svelte/internal/server";
import { createEventDispatcher } from "svelte";
export default function Const($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { a } = $$props;
		const GO = "go";
		const d = createEventDispatcher();
	});
}
