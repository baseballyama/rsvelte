import * as $ from "svelte/internal/server";
export default function Last_comment($$renderer, $$props) {
	// @ts-check
	/** @type {{ n: number }} */
	/** @type {{ n: string }} */
	let { n = 1 } = $$props;
	$$renderer.push(`<p>${$.escape(n)}</p>`);
}
