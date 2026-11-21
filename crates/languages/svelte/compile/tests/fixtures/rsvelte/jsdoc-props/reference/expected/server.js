import * as $ from "svelte/internal/server";
export default function Reference($$renderer, $$props) {
	// @ts-check
	/** @typedef {{ n: string }} Props */
	/** @type {Props} */
	let { n = 1 } = $$props;
	$$renderer.push(`<p>${$.escape(n)}</p>`);
}
