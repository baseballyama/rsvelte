import * as $ from "svelte/internal/server";
export default function Unknown($$renderer, $$props) {
	// @ts-check
	/** @type {Prps} */
	let { n } = $$props;
	$$renderer.push(`<p>${$.escape(n)}</p>`);
}
