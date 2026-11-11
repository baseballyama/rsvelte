import * as $ from "svelte/internal/server";
export default function Style_quoted_call($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { f, x, items } = $$props;
		let n = 1;
		$$renderer.push(`<div${$.attr_style("", {
			left: `${$.stringify(f(x) + n)}px`,
			top: "1px",
			width: f(n),
			color: "red",
			transform: `translate(${$.stringify(f(1))}, 1)`
		})}></div> <div${$.attributes({ ...items }, void 0, void 0, { left: `${$.stringify(f(x))}px` })}></div> `);
		$.css_props($$renderer, true, { "--a": `${$.stringify(f(n))}px` }, () => {
			Comp($$renderer, {});
		});
		$$renderer.push(` <!--[-->`);
		const each_array = $.ensure_array_like(items);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			$$renderer.push(`<span${$.attr_style("", { left: `${$.stringify(f(item.x))}px` })}>${$.escape(item.k)}</span>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
