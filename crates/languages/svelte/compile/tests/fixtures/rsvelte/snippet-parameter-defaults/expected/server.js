import * as $ from "svelte/internal/server";
function t($$renderer, p, v = p(), w = g(), z = g(1)) {
	$$renderer.push(`<!---->${$.escape(v)}${$.escape(w)}${$.escape(z)}`);
}
function g() {
	return 1;
}
export default function Snippet_parameter_defaults($$renderer) {
	t($$renderer, () => 1);
}
