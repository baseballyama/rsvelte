import * as $ from "svelte/internal/server";
import Flaky from "./Flaky.svelte";
export default function Boundary_consts($$renderer) {
	let test = 1;
	let o = {
		a: 1,
		b: [2]
	};
	$$renderer.push(`<button></button> `);
	{
		function failed($$renderer) {
			$$renderer.push(`<p>${$.escape(double)}${$.escape(a)}${$.escape(c)}</p>`);
		}
		$$renderer.boundary({ failed }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);
			{
				const double = test * 2;
				const { a, b: [c] } = o;
				function other($$renderer) {
					$$renderer.push(`<i>${$.escape(double)}</i>`);
				}
				Flaky($$renderer, {});
				$$renderer.push(`<!----> <b>${$.escape(double)}${$.escape(a)}</b> `);
				other($$renderer);
				$$renderer.push(`<!---->`);
			}
			$$renderer.push(`<!--]-->`);
		});
	}
	$$renderer.push(` `);
	$$renderer.push(`<!--[-->`);
	{
		const x = test + 1;
		$$renderer.push(`<p>${$.escape(x)}</p>`);
	}
	$$renderer.push(`<!--]-->`);
}
