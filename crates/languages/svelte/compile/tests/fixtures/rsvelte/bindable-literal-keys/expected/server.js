import * as $ from "svelte/internal/server";
export default function Bindable_literal_keys($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { 10n: a = void 0, 16: b = void 0, "s": c = void 0 } = $$props;
		$$renderer.push(`<!---->${$.escape(a)}${$.escape(b)}${$.escape(c)}`);
		$.bind_props($$props, {
			"10": a,
			"16": b,
			s: c
		});
	});
}
