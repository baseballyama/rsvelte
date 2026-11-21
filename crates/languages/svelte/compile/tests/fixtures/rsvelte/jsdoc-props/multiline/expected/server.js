import * as $ from "svelte/internal/server";
export default function Multiline($$renderer, $$props) {
	// @ts-check
	/**
	 * @type {{
	 *   n: string
	 * }}
	 */
	let { n = 1 } = $$props;
	$$renderer.push(`<p>${$.escape(n)}</p>`);
}
