import * as $ from "svelte/internal/server";
export default function Object($$renderer, $$props) {
	// @ts-check
	/** @type {{ n: string }} */
	let { n = 1, extra } = $$props;
	$$renderer.push(`<p>${$.escape(n)}${$.escape(extra)}</p>`);
}
