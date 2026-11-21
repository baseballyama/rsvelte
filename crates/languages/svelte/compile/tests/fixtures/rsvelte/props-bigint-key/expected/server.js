import * as $ from "svelte/internal/server";
export default function Props_bigint_key($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { 10n: ten = void 0, 0n: zero, $$slots, $$events, ...rest } = $$props;
		ten = 1;
		$$renderer.push(`<!---->${$.escape(ten)}${$.escape(zero)}${$.escape(rest.x)}`);
		$.bind_props($$props, { "10": ten });
	});
}
