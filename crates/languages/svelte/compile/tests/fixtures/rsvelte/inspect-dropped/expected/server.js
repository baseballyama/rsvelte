import * as $ from "svelte/internal/server";
export default function Inspect_dropped($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let a = 1;
		let b = $.derived(() => a * 2);
		;
		;
		;
		;
		function f() {
			;
			;
			return a;
		}
		$$renderer.push(`<button>${$.escape(f())}</button>`);
	});
}
