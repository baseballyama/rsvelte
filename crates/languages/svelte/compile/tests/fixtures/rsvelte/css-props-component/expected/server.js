import * as $ from "svelte/internal/server";
import C from "./C.svelte";
export default function Css_props_component($$renderer, $$props) {
	let { color = "red", Dyn } = $$props;
	let n = 1;
	$.css_props($$renderer, false, {
		"--color": color,
		"--size": "2px"
	}, () => {
		C($$renderer, { a: 1 });
	});
	$$renderer.push(`<svg>`);
	$.css_props($$renderer, false, {
		"--fill": "blue",
		"--w": n
	}, () => {
		C($$renderer, {});
	});
	$$renderer.push(`</svg>`);
	$.css_props($$renderer, false, { "--x": "1" }, () => {
		if (Dyn) {
			$$renderer.push("<!--[-->");
			Dyn($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<p>child</p>`);
				},
				$$slots: { default: true }
			});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
	}, true);
	$.css_props($$renderer, false, { "--y": n }, () => {
		if (Dyn) {
			$$renderer.push("<!--[-->");
			Dyn($$renderer, {});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
	}, true);
}
