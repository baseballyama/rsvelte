import * as $ from "svelte/internal/server";
export default function Render_dynamic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { header, footer, items } = $$props;
		header($$renderer);
		$$renderer.push(`<!----> <div>`);
		footer?.($$renderer, items);
		$$renderer.push(`<!----></div> <!--[-->`);
		const each_array = $.ensure_array_like(items);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			item.view($$renderer);
			$$renderer.push(`<!---->`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
