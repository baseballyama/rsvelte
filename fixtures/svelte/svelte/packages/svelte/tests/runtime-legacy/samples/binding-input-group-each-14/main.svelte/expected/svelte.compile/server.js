import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let group = [];
	const options = [["1", ["1a", "1b"]], ["2", ["2a", "2b"]]];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(options);

	for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
		let [prefix, arr] = each_array[$$index_1];

		$$renderer.push(`<!---->${$.escape(prefix)} <div><!--[-->`);

		const each_array_1 = $.ensure_array_like(arr);

		for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
			let item = each_array_1[$$index];

			$$renderer.push(`<label><input type="checkbox"${$.attr('checked', group.includes(item), true)}${$.attr('value', item)}/> ${$.escape(item)}</label>`);
		}

		$$renderer.push(`<!--]--></div>`);
	}

	$$renderer.push(`<!--]--> <p>${$.escape(JSON.stringify(group))}</p>`);
}