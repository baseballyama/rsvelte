import * as $ from 'svelte/internal/server';

export default function Input_binding($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let list = ['Angular', 'React', 'Solid', 'Svelte', 'Vue', 'Qwik'];
		let filteredList = $.derived(() => list.filter((item) => item.toLowerCase().includes(search.toLowerCase())));
		let search = '';

		$$renderer.push(`<div class="container svelte-1tjsi4d"><input type="search" placeholder="Search"${$.attr('value', search)} class="svelte-1tjsi4d"/> <ul class="svelte-1tjsi4d">`);

		const each_array = $.ensure_array_like(filteredList());

		if (each_array.length !== 0) {
			$$renderer.push('<!--[-->');

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				$$renderer.push(`<li>${$.escape(item)}</li>`);
			}
		} else {
			$$renderer.push(`<!--[!--><p>No results</p>`);
		}

		$$renderer.push(`<!--]--></ul></div>`);
	});
}