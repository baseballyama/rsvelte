import * as $ from "svelte/internal/server";
export default function Runes_slots_interface($$renderer, $$props) {
	let { a } = $$props;
	$$renderer.push(`<p>${$.escape(a)}</p>`);
}
