import * as $ from "svelte/internal/server";
export default function Binding_targets_a_function_or_a_global($$renderer, $$props) {
	function a() {}
	class K {}
	$$renderer.push(`<input${$.attr("value", a)}/> <input${$.attr("value", K)}/> <input${$.attr("value", foo.bar)}/> <p></p> ${$.escape(a)}`);
	$.bind_props($$props, { a });
}
