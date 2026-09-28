import * as $ from 'svelte/internal/server';
import Details from '../Details.svelte';

export default function LeftSidebarCategory($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { category, activeUrlPathName, baseUrl } = $$props;
		let open = true;

		const trim = (x) => {
			x = x.startsWith('/') ? x.slice(1) : x;
			x = x.endsWith('/') ? x.slice(0, -1) : x;

			return x;
		};

		{
			function summary($$renderer) {
				$$renderer.push(`<!---->${$.escape(category.title)}`);
			}

			Details($$renderer, {
				open,
				id: `sidebar-category-${$.stringify(category.title)}`,
				summary,
				children: ($$renderer) => {
					$$renderer.push(`<ul class="my-2"><!--[-->`);

					const each_array = $.ensure_array_like(category.menuItems);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let item = each_array[$$index];

						if (item.isDivider) {
							$$renderer.push(`<!--[0--><div class="mb-2 flex flex-row items-end justify-start gap-1 py-1 pt-4 text-xs font-bold tracking-wide text-white uppercase">${$.escape(item.title)}</div>`);
						} else {
							$$renderer.push(`<!--[-1--><li${$.attr_class($.clsx([
								'sidebar-list-item',
								trim(activeUrlPathName) === trim(`${category.urlPrefix}/${item.slug}`) ? 'border-orange! text-orange font-bold' : 'text-faded'
							]))}><a${$.attr('href', `${baseUrl}${category.urlPrefix.substring(1)}/${item.slug}`)}>${$.escape(item.title)}</a></li>`);
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]--></ul>`);
				},
				$$slots: { summary: true, default: true }
			});
		}
	});
}