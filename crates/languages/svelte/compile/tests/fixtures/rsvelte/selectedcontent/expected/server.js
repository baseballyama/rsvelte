import * as $ from "svelte/internal/server";
export default function Selectedcontent($$renderer, $$props) {
	let { value, items } = $$props;
	$$renderer.select({ value }, ($$renderer) => {
		$$renderer.push(`<button dir="auto"><selectedcontent></selectedcontent></button><!--[-->`);
		const each_array = $.ensure_array_like(items);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			$$renderer.option({ value: item }, ($$renderer) => {
				$$renderer.push(`<span>${$.escape(item)}</span>`);
			}, void 0, void 0, void 0, void 0, true);
		}
		$$renderer.push(`<!--]-->`);
	}, void 0, void 0, void 0, void 0, true);
	$$renderer.push(` <select><button><b>pick</b><selectedcontent></selectedcontent></button>`);
	$$renderer.option({}, ($$renderer) => {
		$$renderer.push(`one`);
	});
	$$renderer.push(`<!></select>`);
}
