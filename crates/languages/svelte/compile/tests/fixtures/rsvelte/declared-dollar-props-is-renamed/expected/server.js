import * as $ from "svelte/internal/server";
export default function Declared_dollar_props_is_renamed($$renderer) {
	function f($$sanitized_props) {
		return $$sanitized_props;
	}
	$$renderer.push(`<b>${$.escape(f(1))}</b>`);
}
