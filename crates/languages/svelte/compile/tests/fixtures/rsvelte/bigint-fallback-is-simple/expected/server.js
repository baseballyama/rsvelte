import * as $ from "svelte/internal/server";
function s($$renderer, q = 2n) {
	$$renderer.push(`<!---->${$.escape(q)}`);
}
export default function Bigint_fallback_is_simple($$renderer, $$props) {
	let { p = 1n } = $$props;
	s($$renderer);
	$$renderer.push(`<!----> ${$.escape(p)}`);
}
