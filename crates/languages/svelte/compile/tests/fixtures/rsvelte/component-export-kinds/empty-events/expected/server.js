import * as $ from "svelte/internal/server";
export default function Empty_events($$renderer, $$props) {
	let { a } = $$props;
	$$renderer.push(`<p>${$.escape(a)}</p>`);
}
