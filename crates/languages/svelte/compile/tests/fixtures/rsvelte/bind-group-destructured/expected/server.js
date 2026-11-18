import * as $ from "svelte/internal/server";
export default function Bind_group_destructured($$renderer) {
	let list = [{
		id: 1,
		data: [{ data: [] }]
	}];
	$$renderer.push(`<!--[-->`);
	const each_array = $.ensure_array_like(list);
	for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
		let { id, data } = each_array[$$index_1];
		const picks = data[0];
		$$renderer.push(`<!--[-->`);
		const each_array_1 = $.ensure_array_like(data);
		for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
			let item = each_array_1[$$index];
			$$renderer.push(`<input type="checkbox"${$.attr("checked", item.data.includes(id), true)}${$.attr("value", id)}/>`);
		}
		$$renderer.push(`<!--]--> <input type="checkbox"${$.attr("checked", picks.data.includes(id), true)}${$.attr("value", id)}/>`);
	}
	$$renderer.push(`<!--]-->`);
}
