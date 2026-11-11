import * as $ from "svelte/internal/server";
import Option from "./Option.svelte";
export default function Rich_select_2($$renderer) {
	let x = 1;
	let html = "";
	$$renderer.push(`<div><select>`);
	Option($$renderer, {});
	$$renderer.push(`<!----><!></select></div> <select><optgroup label="G">`);
	Option($$renderer, {});
	$$renderer.push(`<!----><!></optgroup>${$.html(html)}<!></select> `);
	$$renderer.select({ value: x }, ($$renderer) => {
		Option($$renderer, {});
		$$renderer.push(`<!---->`);
		$$renderer.option({}, ($$renderer) => {
			$$renderer.push(`<b>1</b>`);
		}, void 0, void 0, void 0, void 0, true);
	}, void 0, void 0, void 0, void 0, true);
}
