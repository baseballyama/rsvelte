import * as $ from "svelte/internal/server";
export default function Same_line($$renderer, $$props) {
	// @ts-check
	let /** @type {{ n: string }} */ { n = 1 } = $$props;
	$$renderer.push(`<p>${$.escape(n)}</p>`);
}
