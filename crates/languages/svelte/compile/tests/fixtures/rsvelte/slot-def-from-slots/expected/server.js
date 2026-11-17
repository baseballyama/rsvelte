import * as $ from "svelte/internal/server";
export default function Slot_def_from_slots($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items } = $$props;
		const rest = { extra: 1 };
		$$renderer.push(`<!--[-->`);
		$.slot($$renderer, $$props, "default", {
			first: items[0],
			label: "text",
			mixed: `a ${$.stringify(items.length)}`
		}, null);
		$$renderer.push(`<!--]--> <!--[-->`);
		const each_array = $.ensure_array_like(items);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			$$renderer.push(`<!--[-->`);
			$.slot($$renderer, $$props, "row", $.spread_props([{ item }, rest]), null);
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--> <!--[-->`);
		$.slot($$renderer, $$props, "footer", { class: 1 }, null);
		$$renderer.push(`<!--]-->`);
	});
}
