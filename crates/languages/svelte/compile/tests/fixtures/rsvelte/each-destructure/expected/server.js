import * as $ from "svelte/internal/server";
export default function Each_destructure($$renderer, $$props) {
	let { items, pairs, fixed } = $$props;
	let fallback = "none";
	const plain = [{
		name: "a",
		tags: ["x"]
	}];
	$$renderer.push(`<!--[-->`);
	const each_array = $.ensure_array_like(items);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let { id, name, size = 1, ...rest } = each_array[$$index];
		$$renderer.push(`<p>${$.escape(id)} ${$.escape(name)} ${$.escape(size)} ${$.escape(rest.extra)}</p>`);
	}
	$$renderer.push(`<!--]--> <!--[-->`);
	const each_array_1 = $.ensure_array_like(pairs);
	for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
		let [key, value] = each_array_1[i];
		$$renderer.push(`<span>${$.escape(i)}: ${$.escape(key)}=${$.escape(value)}</span>`);
	}
	$$renderer.push(`<!--]--> <!--[-->`);
	const each_array_2 = $.ensure_array_like(plain);
	for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
		let { name, tags: [first = fallback] } = each_array_2[$$index_2];
		$$renderer.push(`<b>${$.escape(name)} ${$.escape(first)}</b>`);
	}
	$$renderer.push(`<!--]--> <!--[-->`);
	const each_array_3 = $.ensure_array_like(fixed);
	for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
		let { label } = each_array_3[$$index_3];
		$$renderer.push(`<i>${$.escape(label)}</i>`);
	}
	$$renderer.push(`<!--]-->`);
}
