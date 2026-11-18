import * as $ from "svelte/internal/server";
export default function Snippet_nested($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items, children } = $$props;
		function row($$renderer, item, index = 0) {
			$$renderer.push(`<li>${$.escape(index)}: ${$.escape(item.label)}</li>`);
		}
		$$renderer.push(`<ul class="list"><!--[-->`);
		const each_array = $.ensure_array_like(items);
		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];
			row($$renderer, item, i);
		}
		$$renderer.push(`<!--]--></ul> `);
		if (items.length) {
			$$renderer.push("<!--[0-->");
			function empty($$renderer, { title, count = 1 }) {
				$$renderer.push(`<p>${$.escape(title)} ${$.escape(count)}</p>`);
			}
			empty($$renderer, { title: "none" });
		} else {
			$$renderer.push("<!--[-1-->");
		}
		$$renderer.push(`<!--]--> `);
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}
