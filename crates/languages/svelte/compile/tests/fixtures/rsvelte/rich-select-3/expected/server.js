import * as $ from "svelte/internal/server";
import Option from "./Option.svelte";
export default function Rich_select_3($$renderer, $$props) {
	let { p, c } = $$props;
	$$renderer.push(`<select>`);
	$$renderer.push(`<!--[-->`);
	{
		$$renderer.option({}, ($$renderer) => {
			$$renderer.push(`Boundary`);
		});
	}
	$$renderer.push(`<!--]-->`);
	$$renderer.push(`</select> `);
	$$renderer.select({
		...p,
		class: c
	}, ($$renderer) => {
		Option($$renderer, {});
		$$renderer.push(`<!---->`);
	}, void 0, void 0, void 0, void 0, true);
	$$renderer.push(` `);
	$$renderer.select({ ...p }, ($$renderer) => {
		$$renderer.option({
			class: c,
			...p
		}, ($$renderer) => {
			$$renderer.push(`<b>${$.escape(c)}</b>`);
		}, void 0, void 0, void 0, void 0, true);
	});
}
