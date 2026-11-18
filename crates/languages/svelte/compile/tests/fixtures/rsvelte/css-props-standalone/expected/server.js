import * as $ from "svelte/internal/server";
import C from "./C.svelte";
export default function Css_props_standalone($$renderer, $$props) {
	let { show = true, w = 1 } = $$props;
	let items = [1];
	$.css_props($$renderer, true, { "--w": `${$.stringify(w)}px` }, () => {
		C($$renderer, {});
	});
	$$renderer.push(` `);
	if (show) {
		$$renderer.push("<!--[0-->");
		$.css_props($$renderer, true, { "--a": items.length }, () => {
			C($$renderer, {});
		});
	} else {
		$$renderer.push("<!--[-1-->");
	}
	$$renderer.push(`<!--]--> <!--[-->`);
	const each_array = $.ensure_array_like(items);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];
		$.css_props($$renderer, true, { "--b": item }, () => {
			C($$renderer, {
				c: item,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(item)}`);
				},
				$$slots: { default: true }
			});
		});
	}
	$$renderer.push(`<!--]--> <div>`);
	$.css_props($$renderer, true, { "--x": Math.max(w, 2) }, () => {
		C($$renderer, {});
	});
	$$renderer.push(`</div>`);
}
