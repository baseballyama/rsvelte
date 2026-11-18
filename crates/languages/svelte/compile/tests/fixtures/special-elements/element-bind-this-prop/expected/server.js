import * as $ from "svelte/internal/server";
export default function Element_bind_this_prop($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null } = $$props;
		$.element($$renderer, "div");
		$.bind_props($$props, { ref });
	});
}
