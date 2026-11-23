import * as $ from "svelte/internal/server";
import { createEventDispatcher } from "svelte";
export default function Member($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { a } = $$props;
		const K = { go: "go" };
		const d = createEventDispatcher();
	});
}
