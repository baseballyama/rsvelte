import * as $ from "svelte/internal/server";
export default function Statement($$renderer, $$props) {
	// @ts-check
	/** @type {{ n: number }} */
	let a = 1;
	let { n } = $$props;
	$$renderer.push(`<p>${$.escape(n)}1</p>`);
}
