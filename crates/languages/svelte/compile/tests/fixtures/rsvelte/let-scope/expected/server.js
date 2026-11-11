import * as $ from "svelte/internal/server";
import C from "./C.svelte";
export default function Let_scope($$renderer) {
	let x = 1;
	C($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { x }) => {
				$$renderer.push(`<!---->${$.escape(x)}`);
			},
			a: ($$renderer) => {
				$$renderer.push(`<p slot="a">${$.escape(x)}</p>`);
			},
			b: ($$renderer, { y }) => {
				C($$renderer, {
					slot: "b",
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(x)} ${$.escape(y)}`);
					},
					$$slots: { default: true }
				});
			}
		}
	});
	$$renderer.push(`<!----> <button></button>`);
}
