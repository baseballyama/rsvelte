import * as $ from "svelte/internal/server";
export default function Runes_slots_read($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);
	let { a } = $$props;
	if ($$slots.default) {
		$$renderer.push(`<!--[0--><p>${$.escape(a)}</p>`);
	} else {
		$$renderer.push("<!--[-1-->");
	}
	$$renderer.push(`<!--]-->`);
}
