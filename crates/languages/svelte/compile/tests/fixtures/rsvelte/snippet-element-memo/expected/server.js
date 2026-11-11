import * as $ from "svelte/internal/server";
export default function Snippet_element_memo($$renderer) {
	let o = { t: "A" };
	const f = (x) => x;
	function s($$renderer) {
		$$renderer.push(`<!---->x`);
	}
	$$renderer.push(`<span${$.attr_class(`b ${$.stringify(o.t.toLowerCase())}`)}></span> <div><button${$.attr_class($.clsx(f(o.t) ? "c" : ""))}>b</button></div>`);
}
