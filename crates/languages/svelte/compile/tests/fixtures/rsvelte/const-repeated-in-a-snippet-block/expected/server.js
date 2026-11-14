import * as $ from "svelte/internal/server";
export default function Const_repeated_in_a_snippet_block($$renderer, $$props) {
	let { v } = $$props;
	if (v) {
		$$renderer.push("<!--[0-->");
		const h = v;
		function s($$renderer) {
			$$renderer.push(`<!---->${$.escape(h)}`);
		}
		$$renderer.push(`<div>`);
		s($$renderer);
		$$renderer.push(`<!----></div>`);
	} else {
		$$renderer.push("<!--[-1-->");
	}
	$$renderer.push(`<!--]--> `);
	if (v) {
		$$renderer.push("<!--[0-->");
		const k = v;
		function t($$renderer) {
			$$renderer.push(`<!---->${$.escape(k)}`);
		}
		$$renderer.push(`<section><p>`);
		t($$renderer);
		$$renderer.push(`<!----></p></section>`);
	} else {
		$$renderer.push("<!--[-1-->");
	}
	$$renderer.push(`<!--]-->`);
}
