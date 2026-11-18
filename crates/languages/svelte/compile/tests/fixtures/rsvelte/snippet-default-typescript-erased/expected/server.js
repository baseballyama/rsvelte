import * as $ from "svelte/internal/server";
export default function Snippet_default_typescript_erased($$renderer) {
	let obj;
	let n = 1;
	function s($$renderer, p = obj, q = n, r = "x") {
		$$renderer.push(`<!---->${$.escape(p)}${$.escape(q)}${$.escape(r)}`);
	}
	s($$renderer);
}
