import * as $ from "svelte/internal/server";
export default function Snippet_parameter_default_props($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { f } = $$props;
		function t($$renderer, p, v = p(), w = f(), z = (() => 2)()) {
			$$renderer.push(`<!---->${$.escape(v)}${$.escape(w)}${$.escape(z)}`);
		}
		t($$renderer, 1);
	});
}
