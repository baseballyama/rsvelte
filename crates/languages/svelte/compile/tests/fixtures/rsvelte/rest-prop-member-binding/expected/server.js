import * as $ from "svelte/internal/server";
export default function Rest_prop_member_binding($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { p, $$slots, $$events, ...rest } = $$props;
		let obj = {};
		let k = "x";
		let arr = [];
		let s = 0;
		let t;
		function f() {
			rest.w = 1;
			rest.u++;
			let y = rest.r;
			[rest.d] = arr;
			({e: rest.e} = obj);
			rest.a.b = 2;
			[rest.d2, s] = arr;
			({e: rest.e2, s} = obj);
			[t, s] = rest.i;
			t = rest.j;
			return rest.q;
		}
		$$renderer.push(`<input type="checkbox"${$.attr("checked", rest.c, true)}/> <input type="checkbox"${$.attr("checked", rest.sel.includes("v"), true)} value="v"/> <input${$.attr("value", rest.a.b)}/> <input${$.attr("value", obj[rest.k])}/> <input${$.attr("value", rest[k])}/> <input${$.attr("value", rest.p)}/> <div></div> <div></div> <!--[-->`);
		const each_array = $.ensure_array_like(arr);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			$$renderer.push(`<input${$.attr("value", rest.each)}/>`);
		}
		$$renderer.push(`<!--]--> <button>${$.escape(rest.t)}</button>`);
	});
}
