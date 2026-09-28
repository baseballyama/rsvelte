import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		if (data.meta.children) {
			$$renderer.push(`<!--[0--><div class="toc"><!--[-->`);

			const each_array = $.ensure_array_like(data.meta.children);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let [id, title] = each_array[$$index];

				$$renderer.push(`<a${$.attr('href', `#${$.stringify(id)}`)}>${$.escape(title)}</a> <hr/>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (data.content) {
			$$renderer.push('<!--[-->');
			data.content($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}