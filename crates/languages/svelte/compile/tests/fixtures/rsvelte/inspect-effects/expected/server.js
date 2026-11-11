import * as $ from "svelte/internal/server";
export default function Inspect_effects($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let a = 1;
		let b = $.derived(() => a * 2);
		;
		;
		;
		;
		;
		;
		function f() {
			return a;
		}
		let d = $.derived(() => {
			return a;
		});
		if (a) {
			$$renderer.push("<!--[0-->");
			const c = a;
			$$renderer.push(`<p>1</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
		}
		$$renderer.push(`<!--]-->`);
	});
}
