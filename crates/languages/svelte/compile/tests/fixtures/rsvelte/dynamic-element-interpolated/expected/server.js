import * as $ from "svelte/internal/server";
export default function Dynamic_element_interpolated($$renderer, $$props) {
	let { n, t } = $$props;
	$.element($$renderer, "h");
	$$renderer.push(` `);
	$.element($$renderer, t);
	$$renderer.push(` `);
	$.element($$renderer, "d&amp;v");
	$$renderer.push(` `);
	$.element($$renderer, t);
}
