import * as $ from "svelte/internal/server";
export default function Element_attributes_finding($$renderer) {
	const list = [1, 2];
	$$renderer.push(`<input${$.attributes({ ...list }, void 0, void 0, void 0, 4)}/> <a${$.attributes({
		href: "x",
		...list,
		title: "t"
	})}>x</a> `);
	$.element($$renderer, "b", () => {
		$$renderer.push(`${$.attributes({ ...list })}`);
	}, () => {
		$$renderer.push(`x`);
	});
	$$renderer.push(` <x-café${$.attributes({ ...list }, void 0, void 0, void 0, 2)}></x-café>`);
}
