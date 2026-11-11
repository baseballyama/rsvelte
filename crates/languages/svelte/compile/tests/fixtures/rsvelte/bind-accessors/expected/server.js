import * as $ from "svelte/internal/server";
import C from "./C.svelte";
export default function Bind_accessors($$renderer) {
	let v = 1;
	let rest = {};
	function s($$renderer) {
		$$renderer.push(`<i>${$.escape(v)}</i>`);
	}
	let $$settled = true;
	let $$inner_renderer;
	function $$render_inner($$renderer) {
		var bind_get = () => v;
		var bind_set = (x) => v = x;
		$$renderer.push(`<p>before</p> `);
		C($$renderer, $.spread_props([
			{
				a: 1,
				get value() {
					return bind_get();
				},
				set value($$value) {
					bind_set($$value);
				}
			},
			rest,
			{
				b: 2,
				get other() {
					return v;
				},
				set other($$value) {
					v = $$value;
					$$settled = false;
				}
			}
		]));
		$$renderer.push(`<!----> `);
		if (v) {
			$$renderer.push("<!--[0-->");
			var bind_get_1 = () => v;
			var bind_set_1 = (x) => v = x;
			$$renderer.push(`<span>x</span> `);
			C($$renderer, {
				get open() {
					return bind_get_1();
				},
				set open($$value) {
					bind_set_1($$value);
				},
				children: ($$renderer) => {
					$$renderer.push(`<!---->child ${$.escape(v)}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
		}
		$$renderer.push(`<!--]--> `);
		s($$renderer);
		$$renderer.push(`<!---->`);
	}
	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);
	$$renderer.subsume($$inner_renderer);
}
