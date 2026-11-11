import * as $ from "svelte/internal/server";
export default function Slot_element($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items, rest } = $$props;
		let count = 0;
		$$renderer.push(`<ul><!--[-->`);
		$.slot($$renderer, $$props, "default", {}, null);
		$$renderer.push(`<!--]--></ul> <!--[-->`);
		$.slot($$renderer, $$props, "header", $.spread_props([{
			title: "Hi",
			count,
			total: items.length,
			first: items.at(0)
		}, rest]), () => {
			$$renderer.push(`<p>No header ${$.escape(count)}</p>`);
		});
		$$renderer.push(`<!--]--> <div><!--[-->`);
		$.slot($$renderer, $$props, "footer", { label: `a ${$.stringify(count)} b` }, null);
		$$renderer.push(`<!--]--></div> <button>+</button>`);
	});
}
