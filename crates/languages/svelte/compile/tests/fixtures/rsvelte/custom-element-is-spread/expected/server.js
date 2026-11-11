import * as $ from "svelte/internal/server";
export default function Custom_element_is_spread($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	$$renderer.push(`<button is="x-button">a</button> <button${$.attributes({
		is: "x-button",
		...props
	}, void 0, void 0, void 0, 2)}>b</button>`);
}
