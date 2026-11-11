import * as $ from "svelte/internal/server";
export default function Const_destructure($$renderer, $$props) {
	let { items } = $$props;
	let fallback = "n/a";
	$$renderer.push(`<!--[-->`);
	const each_array = $.ensure_array_like(items);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];
		const { width, height } = item.size;
		const [first, second = fallback] = item.tags;
		const { label: title, ...extra } = item;
		$$renderer.push(`<p>${$.escape(width)}x${$.escape(height)} ${$.escape(first)} ${$.escape(second)} ${$.escape(title)} ${$.escape(extra.note)}</p>`);
	}
	$$renderer.push(`<!--]-->`);
}
