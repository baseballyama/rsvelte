import * as $ from "svelte/internal/server";
export default function Bind_group_interpolated_value($$renderer, $$props) {
	let { p, q } = $$props;
	let group = [];
	let one = "";
	let checked = false;
	let items = [1, 2];
	let c = "q";
	function f(x) {
		return x;
	}
	$$renderer.push(`<input type="checkbox"${$.attr("value", `${$.stringify(p)}-${$.stringify(q)}`)}${$.attr("checked", group.includes(`${$.stringify(p)}-${$.stringify(q)}`), true)}/> <input type="radio"${$.attr("value", `x${$.stringify(p)}`)}${$.attr("checked", one === `x${$.stringify(p)}`, true)}/> <input type="radio"${$.attr("value", `${$.stringify(f(p))}${$.stringify(q)}`)}${$.attr("checked", one === `${$.stringify(f(p))}${$.stringify(q)}`, true)}/> <input type="checkbox"${$.attr("value", `${$.stringify(p)}:${$.stringify(f(q))}`)}${$.attr("checked", checked, true)}/> <!--[-->`);
	const each_array = $.ensure_array_like(items);
	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let item = each_array[i];
		$$renderer.push(`<input type="checkbox"${$.attr("value", `${$.stringify(item)}-${$.stringify(i)}-${$.stringify(p)}`)}${$.attr("checked", group.includes(`${$.stringify(item)}-${$.stringify(i)}-${$.stringify(p)}`), true)}/>`);
	}
	$$renderer.push(`<!--]--> <input type="checkbox" value="aq"${$.attr("checked", group.includes("aq"), true)}/> <input type="checkbox" value="it's q"${$.attr("checked", group.includes("it's q"), true)}/> <input type="checkbox" value="say &quot;q&quot; \\ back"${$.attr("checked", group.includes("say \"q\" \\ back"), true)}/> <input type="checkbox" value="lit"${$.attr("checked", group.includes("lit"), true)}/>`);
}
