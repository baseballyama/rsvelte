import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const links = data.docs.map(({ type, title, children }) => ({ title: title[1], href: `/docs/${type}/${title[1]}`, children }));
		const types = links.filter((l) => l.href.includes('types'));
		const functions = links.filter((l) => l.href.includes('functions'));
		const variables = links.filter((l) => l.href.includes('variables'));

		$$renderer.push(`<ul><li>Types <ul><!--[-->`);

		const each_array = $.ensure_array_like(types);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { href, title } = each_array[$$index];

			$$renderer.push(`<li class="type"><a${$.attr('href', href)}>${$.escape(title)}</a></li>`);
		}

		$$renderer.push(`<!--]--></ul></li> <li>Functions <ul><!--[-->`);

		const each_array_1 = $.ensure_array_like(functions);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let { href, title } = each_array_1[$$index_1];

			$$renderer.push(`<li class="type"><a${$.attr('href', href)}>${$.escape(title)}</a></li>`);
		}

		$$renderer.push(`<!--]--></ul></li> <li>Variables <ul><!--[-->`);

		const each_array_2 = $.ensure_array_like(variables);

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let { href, title } = each_array_2[$$index_2];

			$$renderer.push(`<li class="type"><a${$.attr('href', href)}>${$.escape(title)}</a></li>`);
		}

		$$renderer.push(`<!--]--></ul></li></ul>`);
	});
}