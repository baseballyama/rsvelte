import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let entries = [
		{ id: 'a', subitems: ['a'] },
		{ id: 'b', subitems: ['b'] },
		{ id: 'c', subitems: ['c'] },
		{ id: 'd', subitems: ['d'] }
	];

	function onDeleteEntry(entry) {
		entries = entries.filter((innerEntry) => innerEntry.id !== entry.id);
	}

	$$renderer.push(`<ul><!--[-->`);

	const each_array = $.ensure_array_like(entries);

	for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
		let entry = each_array[$$index_1];

		$$renderer.push(`<li><button>Delete</button> ${$.escape(entry.id)} <!--[-->`);

		const each_array_1 = $.ensure_array_like(entry.subitems);

		for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
			let subitem = each_array_1[$$index];

			$$renderer.push(`<!---->${$.escape(subitem)}`);
		}

		$$renderer.push(`<!--]--></li>`);
	}

	$$renderer.push(`<!--]--></ul>`);
}