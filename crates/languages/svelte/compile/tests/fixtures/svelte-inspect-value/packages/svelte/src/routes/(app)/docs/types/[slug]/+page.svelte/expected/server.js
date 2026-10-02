import * as $ from 'svelte/internal/server';
import { createPageTitle } from '$doclib/util.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const title = $.derived(() => data.meta?.title?.[1]);

		$.head('1w33aon', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(createPageTitle(title() ? `type ${title()}` : 'Type'))}</title>`);
			});
		});

		if (data.meta.children) {
			$$renderer.push(`<!--[0--><div class="toc">`);

			if (data.meta.title) {
				$$renderer.push(`<!--[0--><a${$.attr('href', `#${$.stringify(data.meta.title[0])}`)} style="font-weight: bold;">${$.escape(data.meta.title[1])}</a>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <!--[-->`);

			const each_array = $.ensure_array_like(data.meta.children);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let [id, title] = each_array[$$index];

				$$renderer.push(`<a${$.attr('href', `#${$.stringify(id)}`)}>- ${$.escape(title)}</a> <hr/>`);
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