import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const links = data.docs.map(({ type, title, children }) => ({ title: title[1], href: `/docs/${type}/${title[1]}`, children }));
		const types = links.filter((l) => l.href.includes('types'));

		$$renderer.push(`<ul><li>Types <ul><!--[-->`);

		const each_array = $.ensure_array_like(types);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { href, title } = each_array[$$index];

			$$renderer.push(`<li class="type"><a${$.attr('href', href)}>${$.escape(title)}</a></li>`);
		}

		$$renderer.push(`<!--]--></ul></li></ul>`);
	});
}