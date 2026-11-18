import * as $ from "svelte/internal/server";
import C from "./C.svelte";
export default function Bind_group($$renderer) {
	let selected = [];
	let one = "a";
	let v = "x";
	let items = [{ picks: [] }];
	let binding_group = 1;
	let $$settled = true;
	let $$inner_renderer;
	function $$render_inner($$renderer) {
		$$renderer.push(`<input type="checkbox"${$.attr("checked", selected.includes("a"), true)} value="a"/> <input type="checkbox"${$.attr("checked", selected.includes(v), true)}${$.attr("value", v)}/> <input type="radio"${$.attr("checked", one === "b", true)} value="b"/> <input type="radio"/> <!--[-->`);
		const each_array = $.ensure_array_like(items);
		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let item = each_array[$$index_1];
			let i = $$index_1;
			$$renderer.push(`<input type="checkbox"${$.attr("checked", item.picks.includes("p"), true)} value="p"/> <!--[-->`);
			const each_array_1 = $.ensure_array_like([1, 2]);
			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let n = each_array_1[$$index];
				$$renderer.push(`<input type="checkbox"${$.attr("checked", items[i].picks.includes(n), true)}${$.attr("value", n)}/>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--> <!--[-->`);
		const each_array_2 = $.ensure_array_like(items);
		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let item = each_array_2[$$index_2];
			let j = $$index_2;
			$$renderer.push(`<input type="radio"${$.attr("checked", item.picks === j, true)}${$.attr("value", j)}/>`);
		}
		$$renderer.push(`<!--]--> `);
		C($$renderer, {
			get group() {
				return one;
			},
			set group($$value) {
				one = $$value;
				$$settled = false;
			}
		});
		$$renderer.push(`<!---->`);
	}
	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);
	$$renderer.subsume($$inner_renderer);
}
