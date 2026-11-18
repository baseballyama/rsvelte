import * as $ from "svelte/internal/server";
export default function State_eager($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;
		let n = 0;
		const value = $.derived(() => props.number ?? 0);
		const e = n;
		function f() {
			return n + 1;
		}
		$$renderer.push(`<div>value=${$.escape(value())}</div> <div>eager=${$.escape(value())}</div> <button>${$.escape(e)}${$.escape(f())}${$.escape(n)}</button>`);
	});
}
