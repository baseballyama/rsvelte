import * as $ from "svelte/internal/server";
import C from "./C.svelte";
export default function Bind_derived($$renderer) {
	let n = 1;
	let d = $.derived(() => n * 2);
	let e = $.derived(() => n);
	let o = $.derived(() => ({ a: n }));
	let $$settled = true;
	let $$inner_renderer;
	function $$render_inner($$renderer) {
		$$renderer.push(`<input${$.attr("value", d())}/> <input${$.attr("value", o().a)}/> `);
		C($$renderer, {
			get value() {
				return e();
			},
			set value($$value) {
				e($$value);
				$$settled = false;
			}
		});
		$$renderer.push(`<!----> <div></div>`);
	}
	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);
	$$renderer.subsume($$inner_renderer);
}
