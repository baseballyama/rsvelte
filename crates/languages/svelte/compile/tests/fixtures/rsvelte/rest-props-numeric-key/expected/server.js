import * as $ from "svelte/internal/server";
export default function Rest_props_numeric_key($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { 7: seven, "8": eight, 1.5: half, a, $$slots, $$events, ...rest } = $$props;
		$$renderer.push(`<!---->${$.escape(seven)} ${$.escape(eight)} ${$.escape(half)} ${$.escape(a)} ${$.escape(rest.b)}`);
	});
}
