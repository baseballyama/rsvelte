import * as $ from "svelte/internal/server";
import C from "./C.svelte";
function dot($$renderer, r) {
	$$renderer.push(`<circle${$.attr("r", r)}></circle>`);
}
export default function Svg_inferred_fragments($$renderer, $$props) {
	let { show = true, label = "a" } = $$props;
	C($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<rect width="1"${$.attr("height", show ? 1 : 2)}></rect>`);
			dot($$renderer, 2);
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
	$$renderer.push(`<!----> <div><path d="M0 0" viewBox="0 0 1 1"${$.attr_class($.clsx(label))}></path></div> <svg viewBox="0 0 1 1"><foo>`);
	if (show) {
		$$renderer.push(`<!--[0--><circle r="1"></circle>`);
	} else {
		$$renderer.push("<!--[-1-->");
	}
	$$renderer.push(`<!--]--></foo></svg> `);
	if (show) {
		$$renderer.push(`<!--[0--><ellipse rx="1"></ellipse>`);
	} else {
		$$renderer.push("<!--[-1-->");
	}
	$$renderer.push(`<!--]-->`);
}
