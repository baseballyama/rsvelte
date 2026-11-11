import * as $ from "svelte/internal/server";
export default function Rich_select_1($$renderer) {
	let x = 1;
	$$renderer.push(`<select>`);
	$$renderer.option({}, ($$renderer) => {
		$$renderer.push(`<span>Rich ${$.escape(x)}</span>`);
	}, void 0, void 0, void 0, void 0, true);
	$$renderer.option({ value: "b" }, ($$renderer) => {
		$$renderer.push(`<em>Italic</em> text`);
	}, void 0, void 0, void 0, void 0, true);
	$$renderer.push(`</select> `);
	$$renderer.select({ value: x }, ($$renderer) => {
		$$renderer.push(`<optgroup label="G">`);
		$$renderer.option({}, ($$renderer) => {
			$$renderer.push(`<strong>Bold</strong>`);
		}, void 0, void 0, void 0, void 0, true);
		$$renderer.push(`</optgroup>`);
	});
}
